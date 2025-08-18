import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, Clock, AlertCircle, Edit, Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/types';
import { useTasks, useUpdateTaskProgress } from '@/hooks/useApi';

export const EmployeeTasksPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [updatedQty, setUpdatedQty] = useState<number>(0);
  const { toast } = useToast();

  // Fetch tasks from API
  const { data: tasksData, refetch } = useTasks();
  const updateTaskMutation = useUpdateTaskProgress();

  const tasks = tasksData?.data || [];

  const filteredTasks = tasks.filter((task: Task) => {
    const matchesSearch = task.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.processStageeName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeTasks = filteredTasks.filter((t: Task) => t.status === 'active');
  const completedTasks = filteredTasks.filter((t: Task) => t.status === 'completed');
  const overdueTasks = activeTasks.filter((t: Task) => new Date(t.deadline) < new Date());

  const handleUpdateQuantity = async (taskId: string) => {
    const task = tasks.find((t: Task) => t.id === taskId);
    if (!task || updatedQty > task.targetQty) return;

    try {
      await updateTaskMutation.mutateAsync({
        taskId,
        completedQty: updatedQty,
      });
      
      setEditingTask(null);
      setUpdatedQty(0);
      refetch();
      
      toast({
        title: 'Task Updated',
        description: 'Task progress has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update task progress. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitTask = (taskId: string, notes: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, status: 'completed' as const }
        : t
    ));

    toast({ 
      title: 'Task Submitted',
      description: 'Task has been submitted for review'
    });

    setSelectedTask(null);
    setSubmissionNotes('');
  };

  const handleResubmitTask = (taskId: string, newQuantity: number, notes: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { 
            ...t, 
            status: 'active' as const,
            completedQuantity: newQuantity,
            progress: Math.round((newQuantity / t.targetQuantity) * 100),
            rejectionReason: undefined
          }
        : t
    ));

    toast({ 
      title: 'Task Resubmitted',
      description: 'Task has been resubmitted for review'
    });

    setSelectedTask(null);
    setEditQuantity(0);
    setSubmissionNotes('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary">Active</Badge>;
      case 'due_this_week':
        return <Badge variant="outline" className="status-pending">Due This Week</Badge>;
      case 'completed':
        return <Badge variant="outline" className="status-completed">Completed</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProgressColor = (progress: number, status: string) => {
    if (status === 'completed') return 'bg-success';
    if (status === 'overdue' || status === 'rejected') return 'bg-destructive';
    if (progress >= 75) return 'bg-success';
    if (progress >= 50) return 'bg-warning';
    return 'bg-primary';
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <Card key={task.id} className={task.status === 'rejected' ? 'border-destructive' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{task.productName}</CardTitle>
            <p className="text-sm text-muted-foreground">{task.stageName}</p>
          </div>
          {getStatusBadge(task.status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {task.status === 'rejected' && task.rejectionReason && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">Task Rejected</span>
            </div>
            <p className="text-sm text-destructive">{task.rejectionReason}</p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{task.progress}%</span>
          </div>
          <Progress value={task.progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{task.completedQuantity} / {task.targetQuantity} units</span>
            <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
          </div>
        </div>

        {task.notes && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm"><strong>Instructions:</strong> {task.notes}</p>
          </div>
        )}

        <div className="flex gap-2">
          {task.status === 'rejected' ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedTask(task);
                    setEditQuantity(task.completedQuantity);
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Resubmit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Resubmit Task</DialogTitle>
                </DialogHeader>
                
                {selectedTask && (
                  <div className="space-y-4">
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive">{selectedTask.rejectionReason}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="editQuantity">Completed Quantity</Label>
                      <Input
                        id="editQuantity"
                        type="number"
                        min={0}
                        max={selectedTask.targetQuantity}
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="submissionNotes">Submission Notes</Label>
                      <Textarea
                        id="submissionNotes"
                        value={submissionNotes}
                        onChange={(e) => setSubmissionNotes(e.target.value)}
                        placeholder="Describe what was fixed or improved..."
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={() => handleResubmitTask(selectedTask.id, editQuantity, submissionNotes)}
                      className="w-full bg-success hover:bg-success/90"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resubmit Task
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          ) : (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedTask(task);
                      setEditQuantity(task.completedQuantity);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Update
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Task Progress</DialogTitle>
                  </DialogHeader>
                  
                  {selectedTask && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label>Product</Label>
                          <p>{selectedTask.productName}</p>
                        </div>
                        <div>
                          <Label>Stage</Label>
                          <p>{selectedTask.stageName}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="editQuantity">Completed Quantity</Label>
                        <Input
                          id="editQuantity"
                          type="number"
                          min={0}
                          max={selectedTask.targetQuantity}
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Target: {selectedTask.targetQuantity} units
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="submissionNotes">Notes (Optional)</Label>
                        <Textarea
                          id="submissionNotes"
                          value={submissionNotes}
                          onChange={(e) => setSubmissionNotes(e.target.value)}
                          placeholder="Add any notes about your progress..."
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUpdateQuantity(selectedTask.id, editQuantity, submissionNotes)}
                          className="flex-1"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save Progress
                        </Button>
                        
                        {editQuantity >= selectedTask.targetQuantity && (
                          <Button
                            onClick={() => handleSubmitTask(selectedTask.id, submissionNotes)}
                            className="flex-1 bg-success hover:bg-success/90"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Submit
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {task.progress >= 100 && task.status !== 'completed' && (
                <Button
                  onClick={() => handleSubmitTask(task.id, '')}
                  size="sm"
                  className="bg-success hover:bg-success/90"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Submit
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 space-y-6 pb-20">
      <h1 className="text-hero">My Tasks</h1>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Active ({activeTasks.length})
          </TabsTrigger>
          <TabsTrigger value="due">
            Due This Week ({dueThisWeekTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active tasks</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {rejectedTasks.map(task => <TaskCard key={task.id} task={task} />)}
              {activeTasks.filter(t => t.status !== 'rejected').map(task => <TaskCard key={task.id} task={task} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="due" className="space-y-4">
          {dueThisWeekTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No tasks due this week</p>
              </CardContent>
            </Card>
          ) : (
            dueThisWeekTasks.map(task => <TaskCard key={task.id} task={task} />)
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No completed tasks</p>
              </CardContent>
            </Card>
          ) : (
            completedTasks.map(task => <TaskCard key={task.id} task={task} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};