
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, AlertTriangle, Target, TrendingUp, Users, Eye, List, CalendarDays } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Task } from '@/types';
import { useTasks } from '@/hooks/useApi';

export const SupervisorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch tasks from API
  const { data: tasksData } = useTasks();
  const tasks = tasksData?.data || [];

  const activeTasks = tasks.filter((t: Task) => t.status === 'active');
  const completedTasks = tasks.filter((t: Task) => t.status === 'completed');
  const overdueTasks = activeTasks.filter((t: Task) => new Date(t.deadline) < new Date());

  const stats = {
    totalTasks: tasks.length,
    activeTasks: activeTasks.length,
    completedTasks: completedTasks.length,
    overdueTasks: overdueTasks.length,
    completionRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'overdue': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Overview</h1>
          <p className="text-slate-600 mt-1">Monitor and manage your team's tasks</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.activeTasks}</p>
                  <p className="text-sm text-slate-600">Active</p>
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
                  <p className="text-sm text-slate-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.overdueTasks}</p>
                  <p className="text-sm text-slate-600">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-slate-600" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalTasks}</p>
                  <p className="text-sm text-slate-600">Total Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {/* TaskAssignForm is removed as per edit hint */}
        {/* <TaskAssignForm>
          <Button className="w-full h-auto p-4 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Assign New Task</p>
              <p className="text-sm opacity-90">Create and assign tasks to team members</p>
            </div>
          </Button>
        </TaskAssignForm> */}

        {/* Task Views */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Task Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 bg-slate-100">
                <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-white">
                  <List className="w-4 h-4" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-2 data-[state=active]:bg-white">
                  <CalendarDays className="w-4 h-4" />
                  Week View
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4 mt-4">
                {tasks.map((task) => (
                  <div key={task.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{task.productName}</h3>
                        <p className="text-sm text-slate-600">{task.processStageeName}</p>
                        <p className="text-sm text-slate-600">Assigned to: {task.employeeName}</p>
                      </div>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <span className="font-medium text-slate-900">{task.completedQty}</span>
                        <span className="text-slate-600">/{task.targetQty} completed</span>
                      </div>
                      <div className="text-sm text-slate-600">
                        Due: {new Date(task.deadline).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="calendar" className="mt-4">
                <div className="text-center py-8 text-slate-600">
                  <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Calendar view coming soon</p>
                  <p className="text-sm">Week-based task scheduling interface</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};
