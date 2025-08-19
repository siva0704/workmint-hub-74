import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle, XCircle } from 'lucide-react';

const approvalSchema = z.object({
  reason: z.string().optional(),
});

const rejectionSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});

interface TenantApprovalFormProps {
  tenant: {
    id: string;
    factoryName: string;
    address: string;
    workersCount: number;
    ownerEmail: string;
    phone: string;
    status: 'pending' | 'active' | 'rejected' | 'frozen';
  };
  onApprove: (tenantId: string, reason?: string) => Promise<void>;
  onReject: (tenantId: string, reason: string) => Promise<void>;
  isLoading?: boolean;
}

export const TenantApprovalForm: React.FC<TenantApprovalFormProps> = ({
  tenant,
  onApprove,
  onReject,
  isLoading = false,
}) => {
  const approvalForm = useForm<z.infer<typeof approvalSchema>>({
    resolver: zodResolver(approvalSchema),
    defaultValues: {
      reason: '',
    },
  });

  const rejectionForm = useForm<z.infer<typeof rejectionSchema>>({
    resolver: zodResolver(rejectionSchema),
    defaultValues: {
      reason: '',
    },
  });

  const handleApproval = async (data: z.infer<typeof approvalSchema>) => {
    await onApprove(tenant.id, data.reason);
    approvalForm.reset();
  };

  const handleRejection = async (data: z.infer<typeof rejectionSchema>) => {
    await onReject(tenant.id, data.reason);
    rejectionForm.reset();
  };

  if (tenant.status !== 'pending') {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Tenant Approval Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tenant Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Factory Name</h4>
            <p className="font-semibold">{tenant.factoryName}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Workers Count</h4>
            <p className="font-semibold">{tenant.workersCount}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Owner Email</h4>
            <p className="font-semibold">{tenant.ownerEmail}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Phone</h4>
            <p className="font-semibold">{tenant.phone}</p>
          </div>
          <div className="md:col-span-2">
            <h4 className="font-medium text-sm text-muted-foreground">Address</h4>
            <p className="font-semibold">{tenant.address}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Approve Dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="default" 
                className="flex-1 gap-2"
                disabled={isLoading}
              >
                <CheckCircle className="h-4 w-4" />
                Approve Tenant
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Approve Tenant</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to approve {tenant.factoryName}? This will activate their account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Form {...approvalForm}>
                <form onSubmit={approvalForm.handleSubmit(handleApproval)} className="space-y-4">
                  <FormField
                    control={approvalForm.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Approval Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any notes for this approval..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                    <AlertDialogAction type="submit" disabled={isLoading}>
                      {isLoading ? 'Approving...' : 'Approve'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </form>
              </Form>
            </AlertDialogContent>
          </AlertDialog>

          {/* Reject Dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="flex-1 gap-2"
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4" />
                Reject Tenant
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject Tenant</AlertDialogTitle>
                <AlertDialogDescription>
                  Please provide a reason for rejecting {tenant.factoryName}. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Form {...rejectionForm}>
                <form onSubmit={rejectionForm.handleSubmit(handleRejection)} className="space-y-4">
                  <FormField
                    control={rejectionForm.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rejection Reason *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please explain why this tenant is being rejected..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isLoading ? 'Rejecting...' : 'Reject'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </form>
              </Form>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};