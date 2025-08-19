
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, X, Building2, MapPin, Users, Phone, Mail } from 'lucide-react';
import { useApproveTenant, useRejectTenant } from '@/hooks/useApi';
import { Tenant } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TenantApprovalFormProps {
  tenant: Tenant;
  onApprove: (updatedTenant: Tenant) => void;
  onReject: (updatedTenant: Tenant) => void;
}

export const TenantApprovalForm = ({ tenant, onApprove, onReject }: TenantApprovalFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [reason, setReason] = useState('');
  
  const approveMutation = useApproveTenant();
  const rejectMutation = useRejectTenant();

  const handleApprove = () => {
    approveMutation.mutate(
      { tenantId: tenant.id, reason },
      { 
        onSuccess: () => {
          const updatedTenant = { ...tenant, status: 'active' as const };
          onApprove(updatedTenant);
          setAction(null);
          setReason('');
          setIsOpen(false);
        }
      }
    );
  };

  const handleReject = () => {
    if (!reason.trim()) {
      return;
    }
    rejectMutation.mutate(
      { tenantId: tenant.id, reason },
      { 
        onSuccess: () => {
          const updatedTenant = { ...tenant, status: 'rejected' as const, rejectionReason: reason };
          onReject(updatedTenant);
          setAction(null);
          setReason('');
          setIsOpen(false);
        }
      }
    );
  };

  const isLoading = approveMutation.isPending || rejectMutation.isPending;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Review Factory Application
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Review
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Review Factory Application
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Factory Details */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{tenant.factoryName}</h3>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{tenant.address}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{tenant.workersCount} workers</span>
              </div>
              <div>
                <span>Applied: {new Date(tenant.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="truncate">{tenant.ownerEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{tenant.phone}</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Current Status</Label>
              <div className="mt-1">
                <Badge variant={tenant.status === 'pending' ? 'secondary' : 'default'}>
                  {tenant.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Selection */}
          {!action && (
            <div className="flex gap-3">
              <Button
                onClick={() => setAction('approve')}
                className="flex-1"
                variant="default"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => setAction('reject')}
                className="flex-1"
                variant="destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}

          {/* Reason Input */}
          {action && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason" className="text-sm font-medium">
                  {action === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
                </Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    action === 'approve'
                      ? 'Add any notes for the approval...'
                      : 'Please provide a reason for rejection...'
                  }
                  className="mt-2"
                  rows={3}
                  required={action === 'reject'}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setAction(null)}
                  variant="outline"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={action === 'approve' ? handleApprove : handleReject}
                  disabled={isLoading || (action === 'reject' && !reason.trim())}
                  variant={action === 'approve' ? 'default' : 'destructive'}
                >
                  {isLoading ? 'Processing...' : `Confirm ${action}`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
