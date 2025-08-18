
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Factory, Users, Settings } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Tenant } from '@/types';

// Mock data
const mockPendingTenants: Tenant[] = [
  {
    id: '1',
    factoryName: 'Steel Works Manufacturing',
    address: '123 Industrial Ave, Detroit, MI',
    workersCount: 150,
    ownerEmail: 'owner@steelworks.com',
    phone: '+1-555-0123',
    status: 'pending',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    factoryName: 'Precision Electronics',
    address: '456 Tech Park, Austin, TX',
    workersCount: 75,
    ownerEmail: 'admin@precision.com',
    phone: '+1-555-0124',
    status: 'pending',
    createdAt: '2024-01-14T14:20:00Z'
  }
];

export const SuperAdminDashboard = () => {
  const [pendingTenants] = useState(mockPendingTenants);

  const handleApprove = (tenantId: string) => {
    console.log('Approving tenant:', tenantId);
    // TODO: Implement API call
  };

  const handleReject = (tenantId: string) => {
    console.log('Rejecting tenant:', tenantId);
    // TODO: Implement API call with reason
  };

  const stats = {
    pendingApprovals: pendingTenants.length,
    activeTenants: 12,
    totalUsers: 1250,
    systemHealth: 99.9
  };

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
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
                <Factory className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold">{stats.activeTenants}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
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
            {pendingTenants.map((tenant) => (
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
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(tenant.id)}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
            
            {pendingTenants.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending approvals</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4">
          <Button variant="outline" className="h-auto p-4 justify-start">
            <Users className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Tenant Management</p>
              <p className="text-sm text-muted-foreground">Manage all factory tenants</p>
            </div>
          </Button>
          
          <Button variant="outline" className="h-auto p-4 justify-start">
            <Settings className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Global Settings</p>
              <p className="text-sm text-muted-foreground">System configuration</p>
            </div>
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};
