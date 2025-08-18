
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Users, Settings, Plus, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ProductForm } from '@/components/forms/ProductForm';
import { UserInviteForm } from '@/components/forms/UserInviteForm';

export const FactoryAdminDashboard = () => {
  const stats = {
    totalProducts: 24,
    activeUsers: 185,
    completedTasks: 1250,
    pendingTasks: 45
  };

  const recentActivity = [
    { id: 1, action: 'New product added', item: 'Steel Beam A100', time: '2 hours ago' },
    { id: 2, action: 'User invited', item: 'John Supervisor', time: '4 hours ago' },
    { id: 3, action: 'Task completed', item: 'Welding Process', time: '6 hours ago' }
  ];

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good morning, Admin</h1>
          <p className="text-slate-600 mt-1">Here's what's happening at your factory today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalProducts}</p>
                  <p className="text-sm text-slate-500">Products</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-slate-600" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.activeUsers}</p>
                  <p className="text-sm text-slate-500">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.completedTasks}</p>
                  <p className="text-sm text-slate-500">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.pendingTasks}</p>
                  <p className="text-sm text-slate-500">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ProductForm>
              <Button className="w-full h-auto p-4 justify-start bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Add New Product</p>
                  <p className="text-sm opacity-90">Create a new product with process stages</p>
                </div>
              </Button>
            </ProductForm>
            
            <UserInviteForm>
              <Button variant="outline" className="w-full h-auto p-4 justify-start border-slate-200 hover:bg-slate-50">
                <Users className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-slate-900">Invite Team Member</p>
                  <p className="text-sm text-slate-600">Add supervisors or employees</p>
                </div>
              </Button>
            </UserInviteForm>
            
            <Button variant="outline" className="w-full h-auto p-4 justify-start border-slate-200 hover:bg-slate-50">
              <Settings className="w-5 h-5 mr-3" />
              <div className="text-left">
                <p className="font-medium text-slate-900">Factory Settings</p>
                <p className="text-sm text-slate-600">Configure branding and preferences</p>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <TrendingUp className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-slate-900">{activity.action}</p>
                  <p className="text-sm text-slate-600">{activity.item}</p>
                </div>
                <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                  {activity.time}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};
