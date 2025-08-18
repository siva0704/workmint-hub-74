import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, Phone, Mail, Calendar, Snowflake, Play } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { EntityList } from '@/components/ui/entity-list';
import { TenantApprovalForm } from '@/components/forms/TenantApprovalForm';
import { useToast } from '@/hooks/use-toast';
import { Tenant } from '@/types';
import { mockAPI, mockTenants } from '@/stores/mockData';

export const SuperAdminTenants = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const data = await mockAPI.getTenants();
      setTenants(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load tenants',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTenantUpdate = (updatedTenant: Tenant) => {
    setTenants(prev => 
      prev.map(t => t.id === updatedTenant.id ? updatedTenant : t)
    );
  };

  const handleFreezeTenant = async (tenantId: string) => {
    try {
      // Mock freeze functionality
      const tenant = tenants.find(t => t.id === tenantId);
      if (tenant) {
        const updatedTenant = { 
          ...tenant, 
          status: tenant.status === 'frozen' ? 'active' : 'frozen' 
        } as Tenant;
        setTenants(prev => 
          prev.map(t => t.id === tenantId ? updatedTenant : t)
        );
        toast({
          title: `Tenant ${updatedTenant.status === 'frozen' ? 'Frozen' : 'Activated'}`,
          description: `${tenant.factoryName} has been ${updatedTenant.status}.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update tenant status',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'pending': return 'bg-slate-100 text-slate-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'frozen': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTenantItem = (tenant: Tenant) => (
    <Card key={tenant.id}>
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">{tenant.factoryName}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{tenant.address}</p>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{tenant.workersCount} workers</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(tenant.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                <span className="truncate">{tenant.ownerEmail}</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>{tenant.phone}</span>
              </div>
            </div>
          </div>
          
          <Badge className={getStatusColor(tenant.status)}>
            {tenant.status}
          </Badge>
        </div>

        {tenant.rejectionReason && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Rejection Reason:</strong> {tenant.rejectionReason}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {tenant.status === 'pending' && (
            <TenantApprovalForm 
              tenant={tenant}
              onApprove={handleTenantUpdate}
              onReject={handleTenantUpdate}
            />
          )}
          
          {(tenant.status === 'active' || tenant.status === 'frozen') && (
            <Button
              size="sm"
              variant={tenant.status === 'frozen' ? 'default' : 'outline'}
              onClick={() => handleFreezeTenant(tenant.id)}
              className="flex-1"
            >
              {tenant.status === 'frozen' ? (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Activate
                </>
              ) : (
                <>
                  <Snowflake className="w-4 h-4 mr-1" />
                  Freeze
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const filterOptions = [
    { key: 'status' as keyof Tenant, value: 'pending', label: 'Pending' },
    { key: 'status' as keyof Tenant, value: 'active', label: 'Active' },
    { key: 'status' as keyof Tenant, value: 'rejected', label: 'Rejected' },
    { key: 'status' as keyof Tenant, value: 'frozen', label: 'Frozen' }
  ];

  const stats = {
    total: tenants.length,
    pending: tenants.filter(t => t.status === 'pending').length,
    active: tenants.filter(t => t.status === 'active').length,
    rejected: tenants.filter(t => t.status === 'rejected').length,
    frozen: tenants.filter(t => t.status === 'frozen').length
  };

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <div>
          <h1 className="text-hero">Tenant Management</h1>
          <p className="text-muted-foreground mt-1">Manage all factory tenants and applications</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-slate-600">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.frozen}</p>
              <p className="text-sm text-muted-foreground">Frozen</p>
            </CardContent>
          </Card>
        </div>

        {/* Tenant List */}
        <EntityList
          title="All Tenants"
          data={tenants}
          loading={loading}
          searchPlaceholder="Search factories..."
          searchKeys={['factoryName', 'ownerEmail', 'address']}
          filterOptions={filterOptions}
          renderItem={renderTenantItem}
          onRefresh={loadTenants}
          emptyState={
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No factory applications found</p>
            </div>
          }
        />
      </div>
    </MobileLayout>
  );
};
