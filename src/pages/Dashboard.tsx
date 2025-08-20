
import { useAuthStore } from '@/stores/auth';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Package, 
  ClipboardList, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Plus,
  BarChart3
} from 'lucide-react';
import { ProductForm } from '@/components/forms/ProductForm';
import { UserInviteForm } from '@/components/forms/UserInviteForm';
import { TaskAssignForm } from '@/components/forms/TaskAssignForm';
import { TaskReviewForm } from '@/components/forms/TaskReviewForm';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useProducts, useUsers, useTasks } from '@/hooks/useApi';
import { useEffect, useMemo } from 'react';
import { formatActivityTime } from '@/utils/timeUtils';

export const Dashboard = () => {
  const { user } = useAuthStore();
  
  // Fetch real data
  const { data: productsData } = useProducts(1, 100);
  const { data: usersData } = useUsers(1, 100);
  const { data: tasksData } = useTasks();

  const handleViewReports = () => {
    // TODO: Navigate to reports page when created
  };

  const renderAdminDashboard = () => {
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
          icon: Users,
          type: 'user'
        }));
      
      // Add recent tasks
      const recentTasks = tasks
        .slice(0, 3)
        .map(task => ({
          id: `task-${task.id || task._id}`,
          action: task.status === 'completed' ? 'Task completed' : 'Task assigned',
          item: task.productName || 'Task',
          time: formatActivityTime(task.assignedAt || new Date()),
          icon: ClipboardList,
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
                 <div className="flex justify-between items-start">
           <div>
             <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Welcome back!</h1>
             <p className="text-slate-600">Here's what's happening at your factory today.</p>
           </div>
           <ThemeToggle />
         </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Products</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Active Users</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.activeUsers}</p>
                </div>
                <Users className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Quick Actions */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ProductForm>
            <Button className="w-full justify-start tap-target border-slate-200 hover:bg-slate-50" variant="outline">
              <Plus className="mr-3 h-4 w-4" />
              Add New Product
            </Button>
          </ProductForm>
          
          <UserInviteForm>
            <Button className="w-full justify-start tap-target border-slate-200 hover:bg-slate-50" variant="outline">
              <Users className="mr-3 h-4 w-4" />
              Invite Team Member
            </Button>
          </UserInviteForm>
          
          <Button 
            className="w-full justify-start tap-target border-slate-200 hover:bg-slate-50" 
            variant="outline"
            onClick={handleViewReports}
          >
            <BarChart3 className="mr-3 h-4 w-4" />
            View Reports
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                    <IconComponent className="h-4 w-4 text-slate-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                      <p className="text-xs text-slate-500">{activity.item} - {activity.time}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-slate-500">
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
  }

  const renderSupervisorDashboard = () => {
    const tasks = tasksData?.data || [];
    const activeTasks = tasks.filter((t: any) => t.status === 'active');
    const overdueTasks = activeTasks.filter((t: any) => new Date(t.deadline) < new Date());
    const pendingReviews = tasks.filter((t: any) => t.status === 'completed' && !t.confirmed);

    return (
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Team Overview</h1>
            <p className="text-slate-600">Manage your team's tasks and progress.</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Active Tasks</p>
                  <p className="text-2xl font-bold text-slate-900">{activeTasks.length}</p>
                </div>
                <ClipboardList className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{overdueTasks.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Quick Actions */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <TaskAssignForm>
            <Button className="w-full justify-start tap-target bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="mr-3 h-4 w-4" />
              Assign New Task
            </Button>
          </TaskAssignForm>
          
          <TaskReviewForm>
            <Button className="w-full justify-start tap-target" variant="outline">
              <CheckCircle className="mr-3 h-4 w-4" />
              Review Completed Tasks
            </Button>
          </TaskReviewForm>
        </CardContent>
      </Card>

      {/* Pending Reviews */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Pending Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingReviews.length > 0 ? (
            pendingReviews.map((task: any) => (
              <div key={task.id || task._id} className="p-3 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-slate-900">{task.productName || 'Task'}</h3>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Review Needed</span>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  Completed: {task.completedQty}/{task.targetQty} units
                </p>
                <TaskReviewForm taskName={task.productName || 'Task'} completedQty={task.completedQty} targetQty={task.targetQty}>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Review Task
                  </Button>
                </TaskReviewForm>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-slate-500">
              <p className="text-sm">No pending reviews</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
  }

  const renderEmployeeDashboard = () => {
    const tasks = tasksData?.data || [];
    const userTasks = tasks.filter((t: any) => t.employeeId === user?.id || t.employeeId === user?._id);
    const activeTasks = userTasks.filter((t: any) => t.status === 'active');
    const completedTasks = userTasks.filter((t: any) => t.status === 'completed');
    
    const totalProgress = activeTasks.length > 0 
      ? activeTasks.reduce((sum: number, task: any) => sum + (task.completedQty / task.targetQty), 0) / activeTasks.length * 100
      : 0;

    return (
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">My Tasks</h1>
            <p className="text-slate-600">Track your progress and complete assignments.</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Task Progress */}
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-500">Today's Progress</p>
                <p className="text-2xl font-bold text-slate-900">{Math.round(totalProgress)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${totalProgress}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

      {/* Active Tasks */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Active Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeTasks.length > 0 ? (
            activeTasks.map((task: any) => {
              const progress = (task.completedQty / task.targetQty) * 100;
              const isOverdue = new Date(task.deadline) < new Date();
              
              return (
                <div key={task.id || task._id} className="p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-slate-900">{task.productName || 'Task'}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isOverdue 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {isOverdue ? 'Overdue' : 'Active'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">Complete: {task.completedQty}/{task.targetQty} units</p>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mb-3">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isOverdue ? 'bg-red-500' : 'bg-emerald-600'
                      }`} 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Update Progress
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-slate-500">
              <p className="text-sm">No active tasks</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
  }

  const renderDashboard = () => {
    switch (user?.role) {
      case 'factory_admin':
        return renderAdminDashboard();
      case 'supervisor':
        return renderSupervisorDashboard();
      case 'employee':
        return renderEmployeeDashboard();
      default:
        return (
          <div className="p-4 text-center">
            <p className="text-slate-600">Dashboard not available for this role.</p>
          </div>
        );
    }
  };

  return (
    <div>
      {renderDashboard()}
    </div>
  );
};
