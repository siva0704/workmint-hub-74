import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Clock, CheckCircle, XCircle, Search, Filter, Eye } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { TenantApprovalForm } from '@/components/forms/TenantApprovalForm';
import { Tenant } from '@/types';
import { useTenants, useApproveTenant, useRejectTenant } from '@/hooks/useApi';

export const SuperAdminTenants = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [activeTab, setActiveTab] = useState('pending');

  // Fetch tenants from API
  const { data: tenantsData, refetch } = useTenants(1, 100);
  const approveMutation = useApproveTenant();
  const rejectMutation = useRejectTenant();

  const tenants = tenantsData?.data || [];

  const filteredTenants = tenants.filter((tenant: Tenant) => 
    tenant.factoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingTenants = filteredTenants.filter((t: Tenant) => t.status === 'pending');
  const activeTenants = filteredTenants.filter((t: Tenant) => t.status === 'active');
  const rejectedTenants = filteredTenants.filter((t: Tenant) => t.status === 'rejected');
  const frozenTenants = filteredTenants.filter((t: Tenant) => t.status === 'frozen');

  const handleApprove = (updatedTenant: Tenant) => {
    refetch();
  };

  const handleReject = (updatedTenant: Tenant) => {
    refetch();
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
                {/* <Users className="w-3 h-3" /> */}
                <span>{tenant.workersCount} workers</span>
              </div>
              <div className="flex items-center gap-1">
                {/* <Calendar className="w-3 h-3" /> */}
                <span>{new Date(tenant.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                {/* <Mail className="w-3 h-3" /> */}
                <span className="truncate">{tenant.ownerEmail}</span>
              </div>
              <div className="flex items-center gap-1">
                {/* <Phone className="w-3 h-3" /> */}
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
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}
          

        </div>
      </CardContent>
    </Card>
  );



  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-hero">Factory Management</h1>
            <p className="text-muted-foreground mt-1">Manage factory registrations and approvals</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search factories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending ({pendingTenants.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Active ({activeTenants.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Rejected ({rejectedTenants.length})
            </TabsTrigger>
            <TabsTrigger value="frozen" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Frozen ({frozenTenants.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingTenants.map((tenant) => (
              <Card key={tenant.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{tenant.factoryName}</h3>
                      <p className="text-sm text-muted-foreground">{tenant.address}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                        <div className="flex items-center gap-1">
                          <span>{tenant.workersCount} workers</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>{new Date(tenant.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="truncate">{tenant.ownerEmail}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>{tenant.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <TenantApprovalForm 
                        tenant={tenant}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeTenants.map((tenant) => (
              <Card key={tenant.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{tenant.factoryName}</h3>
                      <p className="text-sm text-muted-foreground">{tenant.address}</p>
                      <Badge variant="default" className="mt-2">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedTenants.map((tenant) => (
              <Card key={tenant.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{tenant.factoryName}</h3>
                      <p className="text-sm text-muted-foreground">{tenant.address}</p>
                      <Badge variant="destructive" className="mt-2">Rejected</Badge>
                      {tenant.rejectionReason && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Reason: {tenant.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="frozen" className="space-y-4">
            {frozenTenants.map((tenant) => (
              <Card key={tenant.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{tenant.factoryName}</h3>
                      <p className="text-sm text-muted-foreground">{tenant.address}</p>
                      <Badge variant="secondary" className="mt-2">Frozen</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {tenants.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No tenants found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
};
