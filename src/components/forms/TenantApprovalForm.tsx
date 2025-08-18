
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, X, Building2, MapPin, Users } from 'lucide-react';
import { useApproveTenant, useRejectTenant } from '@/hooks/useApi';
import { Tenant } from '@/types';

interface TenantApprovalFormProps {
  tenant: Tenant;
  onApprove: (updatedTenant: Tenant) => void;
  onReject: (updatedTenant: Tenant) => void;
}

export const TenantApprovalForm = ({ tenant, onApprove, onReject }: TenantApprovalFormProps) => {
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
        {/* Factory Details */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{tenant.factoryName}</h3>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{tenant.address}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Workers Count</Label>
              <div className="flex items-center gap-2 mt-1">
                <Users className="h-4 w-4" />
                <span>{tenant.workersCount} employees</span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Application Date</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(tenant.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Owner Contact</Label>
            <div className="mt-1">
              <p className="text-sm">{tenant.ownerEmail}</p>
              <p className="text-sm text-muted-foreground">{tenant.phone}</p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Status</Label>
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
      </CardContent>
    </Card>
  );
};
