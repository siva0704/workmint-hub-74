
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Factory, Users, Activity, CheckCircle, XCircle, Building2, TrendingUp } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useTenants, useApproveTenant, useRejectTenant, useSystemStats } from '@/hooks/useApi';
import { formatActivityTime } from '@/utils/timeUtils';
import { useAuthStore } from '@/stores/auth';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export const SuperAdminDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: tenantsData, refetch, isLoading } = useTenants(1, 100);
  const { data: systemStatsData, isLoading: statsLoading } = useSystemStats();
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
    systemHealth: systemStatsData?.data?.systemUptime || '99.9%'
  };

  return (
    <div className="p-4 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Super Admin Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage factory registrations and system oversight</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-slate-600" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.pendingApprovals}</p>
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
                  <p className="text-2xl font-bold text-slate-900">{stats.activeTenants}</p>
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
                  <p className="text-2xl font-bold text-slate-900">{stats.totalTenants}</p>
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
                  <p className="text-2xl font-bold text-slate-900">{stats.systemHealth}</p>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
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
              <div key={tenant._id || tenant.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{tenant.factoryName}</h3>
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
                    onClick={() => handleApprove(tenant._id || tenant.id)}
                    disabled={approveMutation.isPending}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {approveMutation.isPending ? 'Approving...' : 'Approve'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(tenant._id || tenant.id)}
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
              <p className="text-slate-600">No pending approvals</p>
            </div>
            )}
          </CardContent>
        </Card>

        {/* System Health Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Activity className="w-5 h-5" />
              System Health Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statsLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : systemStatsData?.data ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {systemStatsData.data.totalUsers?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {systemStatsData.data.totalTasks?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Completed Tasks</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {systemStatsData.data.completedTasks?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">System Load</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {systemStatsData.data.systemLoad || '0'}%
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Storage Used</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {systemStatsData.data.storageUsed || '0 TB'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Active Connections</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {systemStatsData.data.activeConnections?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Unable to load system statistics</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <TrendingUp className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tenants.slice(0, 5).map((tenant: any) => (
              <div key={tenant._id || tenant.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                <Building2 className="w-4 h-4 text-slate-600" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-900">
                    {tenant.status === 'pending' ? 'New factory registration' : 
                     tenant.status === 'approved' ? 'Factory approved' : 'Factory status updated'}
                  </p>
                  <p className="text-sm text-slate-600">{tenant.factoryName}</p>
                </div>
                <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                  {formatActivityTime(tenant.createdAt || new Date())}
                </Badge>
              </div>
            ))}
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
  );
};
