
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Factory, Users, Activity, CheckCircle, XCircle, Building2 } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useTenants, useApproveTenant, useRejectTenant } from '@/hooks/useApi';
import { useAuthStore } from '@/stores/auth';
import { useNavigate } from 'react-router-dom';

export const SuperAdminDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: tenantsData, refetch, isLoading } = useTenants(1, 100);
  const approveMutation = useApproveTenant();
  const rejectMutation = useRejectTenant();

  // Role-based access control
  useEffect(() => {
    if (user?.role !== 'super_admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (user?.role !== 'super_admin') {
    return null;
  }

  const tenants = tenantsData?.data || [];
  const pendingTenants = tenants.filter((tenant: any) => tenant.status === 'pending');
  const activeTenants = tenants.filter((tenant: any) => tenant.status === 'active');

  const handleApprove = (tenantId: string) => {
    approveMutation.mutate(
      { tenantId, reason: 'Approved by super admin' },
      {
        onSuccess: () => {
          refetch();
        }
      }
    );
  };

  const handleReject = (tenantId: string) => {
    rejectMutation.mutate(
      { tenantId, reason: 'Application does not meet requirements' },
      {
        onSuccess: () => {
          refetch();
        }
      }
    );
  };

  const stats = {
    pendingApprovals: pendingTenants.length,
    activeTenants: activeTenants.length,
    totalTenants: tenants.length,
    systemHealth: 99.9
  };

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Super Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage factory registrations and system oversight</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-slate-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.activeTenants}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Factory className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalTenants}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.systemHealth}%</p>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Factory Approvals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse border rounded-lg p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : pendingTenants.length > 0 ? (
              pendingTenants.map((tenant: any) => (
              <div key={tenant.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{tenant.factoryName}</h3>
                    <p className="text-sm text-muted-foreground">{tenant.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {tenant.workersCount} workers • {tenant.ownerEmail}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(tenant.id)}
                    disabled={approveMutation.isPending}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {approveMutation.isPending ? 'Approving...' : 'Approve'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(tenant.id)}
                    disabled={rejectMutation.isPending}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                  </Button>
                </div>
              </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending approvals</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4">
          <Button 
            variant="outline" 
            className="h-auto p-4 justify-start"
            onClick={() => navigate('/tenants')}
          >
            <Users className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Tenant Management</p>
              <p className="text-sm text-muted-foreground">Manage all factory tenants</p>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 justify-start"
            onClick={() => navigate('/super-admin/settings')}
          >
            <Activity className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Global Settings</p>
              <p className="text-sm text-muted-foreground">Configure system policies</p>
            </div>
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};
