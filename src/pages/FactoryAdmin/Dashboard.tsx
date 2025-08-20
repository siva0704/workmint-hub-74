
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Users, Settings, Plus, TrendingUp, Clock, CheckCircle, UserPlus, FileText } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ProductForm } from '@/components/forms/ProductForm';
import { UserInviteForm } from '@/components/forms/UserInviteForm';
import { PWAInstallCard } from '@/components/PWAInstallCard';
import { useProducts, useUsers, useTasks } from '@/hooks/useApi';
import { useAuthStore } from '@/stores/auth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { formatActivityTime } from '@/utils/timeUtils';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export const FactoryAdminDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const { data: productsData } = useProducts(1, 100);
  const { data: usersData } = useUsers(1, 100);
  const { data: tasksData } = useTasks();
  
  // Role-based access control
  useEffect(() => {
    if (user?.role !== 'factory_admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (user?.role !== 'factory_admin') {
    return null;
  }

  const products = productsData?.data || [];
  const users = usersData?.data || [];
  const tasks = tasksData?.data || [];

  const stats = {
    totalProducts: products.length,
    activeUsers: users.filter((u: any) => u.isActive).length,
    completedTasks: tasks.filter((t: any) => t.status === 'completed' || t.status === 'confirmed').length,
    pendingTasks: tasks.filter((t: any) => t.status === 'active').length
  };

  const recentActivity = useMemo(() => {
    const activities = [];
    
    // Add recent products
    const recentProducts = products
      .slice(0, 3)
      .map(product => ({
        id: `product-${product.id || product._id}`,
        action: 'New product added',
        item: product.name,
        time: formatActivityTime(product.createdAt || new Date()),
        icon: Package,
        type: 'product'
      }));
    
    // Add recent users
    const recentUsers = users
      .slice(0, 3)
      .map(user => ({
        id: `user-${user.id || user._id}`,
        action: 'User invited',
        item: user.name,
        time: formatActivityTime(user.createdAt || new Date()),
        icon: UserPlus,
        type: 'user'
      }));
    
    // Add recent tasks
    const recentTasks = tasks
      .slice(0, 3)
      .map(task => ({
        id: `task-${task.id || task._id}`,
        action: task.status === 'completed' ? 'Task completed' : 'Task assigned',
        item: task.productName,
        time: formatActivityTime(task.assignedAt || new Date()),
        icon: FileText,
        type: 'task'
      }));
    
    // Combine and sort by time (most recent first)
    const allActivities = [...recentProducts, ...recentUsers, ...recentTasks];
    return allActivities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);
  }, [products, users, tasks]);

  return (
    <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Good morning, {user?.name}</h1>
            <p className="text-slate-600 mt-1">Here's what's happening at your factory today</p>
          </div>
          <ThemeToggle />
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
            <ProductForm onSuccess={() => window.location.reload()}>
              <Button className="w-full h-auto p-4 justify-start bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Add New Product</p>
                  <p className="text-sm opacity-90">Create a new product with process stages</p>
                </div>
              </Button>
            </ProductForm>
            
            <UserInviteForm onSubmit={() => window.location.reload()}>
              <Button variant="outline" className="w-full h-auto p-4 justify-start border-slate-200 hover:bg-slate-50">
                <Users className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-slate-900">Invite Team Member</p>
                  <p className="text-sm text-slate-600">Add supervisors or employees</p>
                </div>
              </Button>
            </UserInviteForm>
            
            <Button 
              variant="outline" 
              className="w-full h-auto p-4 justify-start border-slate-200 hover:bg-slate-50"
              onClick={() => navigate('/settings')}
            >
              <Settings className="w-5 h-5 mr-3" />
              <div className="text-left">
                <p className="font-medium text-slate-900">Factory Settings</p>
                <p className="text-sm text-slate-600">Configure branding and preferences</p>
              </div>
            </Button>
            
            <PWAInstallCard />
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
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                    <IconComponent className="w-4 h-4 text-slate-600" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900">{activity.action}</p>
                      <p className="text-sm text-slate-600">{activity.item}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                      {activity.time}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-slate-500">
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
};
