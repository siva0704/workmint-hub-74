import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertTriangle, Target, TrendingUp, Edit3 } from 'lucide-react';
import { TenantHeader } from '@/components/layout/TenantHeader';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Task } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Mock data
const mockTasks: Task[] = [
  {
    id: '1',
    tenantId: 'tenant1',
    employeeId: 'emp1',
    employeeName: 'John Worker',
    productId: 'prod1',
    productName: 'Steel Beam A100',
    processStageId: 'stage1',
    processStageeName: 'Welding Process',
    targetQty: 50,
    completedQty: 35,
    progress: 70,
    status: 'active',
    deadlineWeek: '2024-W03',
    deadline: '2024-01-21T23:59:59Z',
    notes: 'Focus on quality control',
    assignedBy: 'supervisor1',
    assignedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    tenantId: 'tenant1',
    employeeId: 'emp1',
    employeeName: 'John Worker',
    productId: 'prod2',
    productName: 'Steel Pipe B200',
    processStageId: 'stage2',
    processStageeName: 'Assembly',
    targetQty: 30,
    completedQty: 15,
    progress: 50,
    status: 'active',
    deadlineWeek: '2024-W04',
    deadline: '2024-01-28T23:59:59Z',
    assignedBy: 'supervisor1',
    assignedAt: '2024-01-16T14:00:00Z'
  },
  {
    id: '3',
    tenantId: 'tenant1',
    employeeId: 'emp1',
    employeeName: 'John Worker',
    productId: 'prod3',
    productName: 'Steel Beam C300',
    processStageId: 'stage1',
    processStageeName: 'Welding Process',
    targetQty: 25,
    completedQty: 25,
    progress: 100,
    status: 'completed',
    deadlineWeek: '2024-W02',
    deadline: '2024-01-14T23:59:59Z',
    assignedBy: 'supervisor1',
    assignedAt: '2024-01-08T09:00:00Z',
    completedAt: '2024-01-12T17:30:00Z'
  }
];

export const EmployeeDashboard = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const [activeTab, setActiveTab] = useState('active');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [updatedQty, setUpdatedQty] = useState<number>(0);
  const { toast } = useToast();

  const activeTasks = tasks.filter(t => t.status === 'active');
  const dueTasks = activeTasks.filter(t => new Date(t.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const stats = {
    activeTasks: activeTasks.length,
    dueTasks: dueTasks.length,
    completedTasks: completedTasks.length,
    weeklyTarget: 125
  };

  const handleUpdateQuantity = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || updatedQty > task.targetQty) return;

    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { 
            ...t, 
            completedQty: updatedQty, 
            progress: Math.round((updatedQty / t.targetQty) * 100),
            status: updatedQty === t.targetQty ? 'completed' : 'active'
          }
        : t
    ));

    toast({
      title: 'Progress updated',
      description: `Completed quantity updated to ${updatedQty}`,
    });

    setEditingTask(null);
  };

  const startEditing = (task: Task) => {
    setEditingTask(task.id);
    setUpdatedQty(task.completedQty);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="mb-4">
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold">{task.productName}</h3>
            <p className="text-sm text-muted-foreground">{task.processStageeName}</p>
            {task.notes && (
              <p className="text-sm text-blue-600 mt-1">📝 {task.notes}</p>
            )}
          </div>
          <Badge className={getStatusColor(task.status)}>
            {task.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{task.progress}%</span>
          </div>
          <Progress value={task.progress} className="h-2" />
        </div>

        <div className="flex justify-between items-center">
          {editingTask === task.id ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                type="number"
                value={updatedQty}
                onChange={(e) => setUpdatedQty(Number(e.target.value))}
                max={task.targetQty}
                min={0}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">/ {task.targetQty}</span>
              <Button 
                size="sm" 
                onClick={() => handleUpdateQuantity(task.id)}
                disabled={updatedQty > task.targetQty}
              >
                Save
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setEditingTask(null)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <div className="text-sm">
                <span className="font-medium">{task.completedQty}</span>
                <span className="text-muted-foreground">/{task.targetQty} completed</span>
              </div>
              {task.status === 'active' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => startEditing(task)}
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Update
                </Button>
              )}
            </>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          Due: {new Date(task.deadline).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MobileLayout>
      <TenantHeader />
      
      <div className="p-4 space-y-6">
        <div>
          <h1 className="text-hero">My Tasks</h1>
          <p className="text-muted-foreground mt-1">Track and update your work progress</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.activeTasks}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-warning" />
                <div>
                  <p className="text-2xl font-bold">{stats.dueTasks}</p>
                  <p className="text-sm text-muted-foreground">Due Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-success" />
                <div>
                  <p className="text-2xl font-bold">{stats.completedTasks}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.weeklyTarget}</p>
                  <p className="text-sm text-muted-foreground">Week Target</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Tabs */}
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="active">Active ({stats.activeTasks})</TabsTrigger>
                <TabsTrigger value="due">Due Soon ({stats.dueTasks})</TabsTrigger>
                <TabsTrigger value="completed">Done ({stats.completedTasks})</TabsTrigger>
              </TabsList>
              
              <div className="p-4">
                <TabsContent value="active" className="mt-0">
                  {activeTasks.length > 0 ? (
                    activeTasks.map(task => <TaskCard key={task.id} task={task} />)
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No active tasks</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="due" className="mt-0">
                  {dueTasks.length > 0 ? (
                    dueTasks.map(task => <TaskCard key={task.id} task={task} />)
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No tasks due soon</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="completed" className="mt-0">
                  {completedTasks.length > 0 ? (
                    completedTasks.map(task => <TaskCard key={task.id} task={task} />)
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No completed tasks</p>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};