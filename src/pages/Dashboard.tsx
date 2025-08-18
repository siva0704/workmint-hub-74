
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

export const Dashboard = () => {
  const { user } = useAuthStore();

  const handleViewReports = () => {
    console.log('View reports clicked');
    // TODO: Navigate to reports page when created
  };

  const renderAdminDashboard = () => (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Welcome back!</h1>
        <p className="text-slate-600">Here's what's happening at your factory today.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Products</p>
                <p className="text-2xl font-bold text-slate-900">12</p>
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
                <p className="text-2xl font-bold text-slate-900">48</p>
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
            <Button className="w-full justify-start tap-target" variant="outline">
              <Plus className="mr-3 h-4 w-4" />
              Add New Product
            </Button>
          </ProductForm>
          
          <UserInviteForm>
            <Button className="w-full justify-start tap-target" variant="outline">
              <Users className="mr-3 h-4 w-4" />
              Invite Team Member
            </Button>
          </UserInviteForm>
          
          <Button 
            className="w-full justify-start tap-target" 
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
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Task completed by John Doe</p>
                <p className="text-xs text-slate-500">Widget Assembly - 2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <Clock className="h-4 w-4 text-amber-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">New task assigned</p>
                <p className="text-xs text-slate-500">Quality Check - 3 hours ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSupervisorDashboard = () => (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Team Overview</h1>
        <p className="text-slate-600">Manage your team's tasks and progress.</p>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Active Tasks</p>
                <p className="text-2xl font-bold text-slate-900">24</p>
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
                <p className="text-2xl font-bold text-red-600">3</p>
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
          <div className="p-3 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-slate-900">Widget Assembly</h3>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Review Needed</span>
            </div>
            <p className="text-sm text-slate-600 mb-3">Completed: 45/60 units by John Doe</p>
            <TaskReviewForm taskName="Widget Assembly" completedQty={45} targetQty={60}>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Review Task
              </Button>
            </TaskReviewForm>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEmployeeDashboard = () => (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">My Tasks</h1>
        <p className="text-slate-600">Track your progress and complete assignments.</p>
      </div>

      {/* Task Progress */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Today's Progress</p>
              <p className="text-2xl font-bold text-slate-900">75%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div className="bg-emerald-600 h-2 rounded-full transition-all duration-300" style={{ width: '75%' }}></div>
          </div>
        </CardContent>
      </Card>

      {/* Active Tasks */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Active Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-slate-900">Widget Assembly</h3>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Active</span>
            </div>
            <p className="text-sm text-slate-600 mb-2">Complete: 45/60 units</p>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mb-3">
              <div className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300" style={{ width: '75%' }}></div>
            </div>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Update Progress
            </Button>
          </div>
          
          <div className="p-3 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-slate-900">Quality Check</h3>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Due Soon</span>
            </div>
            <p className="text-sm text-slate-600 mb-2">Complete: 8/20 units</p>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mb-3">
              <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-300" style={{ width: '40%' }}></div>
            </div>
            <Button size="sm" variant="outline">
              Update Progress
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

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
    <MobileLayout>
      {renderDashboard()}
    </MobileLayout>
  );
};
