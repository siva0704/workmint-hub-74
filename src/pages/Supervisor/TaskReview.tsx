import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, AlertTriangle, Eye, Check, X } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { TaskReviewForm } from '@/components/forms/TaskReviewForm';
import { Task } from '@/types';
import { useTasks, useConfirmTask, useRejectTask } from '@/hooks/useApi';

export const TaskReviewPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Fetch tasks from API
  const { data: tasksData, refetch } = useTasks();
  const confirmTaskMutation = useConfirmTask();
  const rejectTaskMutation = useRejectTask();

  const tasks = tasksData?.data || [];
  const pendingTasks = tasks.filter((t: Task) => t.status === 'completed');
  const confirmedTasks = tasks.filter((t: Task) => t.status === 'confirmed');
  const rejectedTasks = tasks.filter((t: Task) => t.status === 'rejected');

  const filteredTasks = (() => {
    const currentTasks = activeTab === 'pending' ? pendingTasks : 
                        activeTab === 'confirmed' ? confirmedTasks : rejectedTasks;
    
    return currentTasks.filter((task: Task) => 
      task.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.processStageeName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  })();

  const handleApprove = (taskId: string, approvedQuantity?: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const finalQuantity = approvedQuantity || task.completedQuantity;
    
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, status: 'approved' as const, completedQuantity: finalQuantity }
        : t
    ));

    // If partial approval, create residual task
    if (finalQuantity < task.targetQuantity) {
      const residualTask: Task = {
        ...task,
        id: `${taskId}-residual`,
        targetQuantity: task.targetQuantity - finalQuantity,
        completedQuantity: 0,
        status: 'in_progress',
        submittedAt: '',
        submissionNotes: '',
        notes: `Residual task from partial completion. Original task: ${taskId}`
      };
      setTasks(prev => [...prev, residualTask]);
    }

    toast({ 
      title: 'Task Approved',
      description: finalQuantity < task.targetQuantity 
        ? `Approved ${finalQuantity} units. Residual task created.`
        : 'Task fully approved'
    });
    
    setSelectedTask(null);
    setReviewNotes('');
    setPartialQuantity(0);
  };

  const handleReject = (taskId: string, reason: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, status: 'rejected' as const }
        : t
    ));

    toast({ 
      title: 'Task Rejected',
      description: reason,
      variant: 'destructive'
    });
    
    setSelectedTask(null);
    setReviewNotes('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <Badge variant="outline" className="status-pending">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="outline" className="status-active">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProgressPercentage = (completed: number, target: number) => {
    return Math.round((completed / target) * 100);
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-hero">Task Review</h1>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            Pending Review ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed">
            Reviewed ({reviewedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tasks pending review</p>
              </CardContent>
            </Card>
          ) : (
            pendingTasks.map((task) => (
              <Card key={task.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{task.productName} - {task.stageName}</CardTitle>
                      <p className="text-sm text-muted-foreground">Assigned to: {task.employeeName}</p>
                    </div>
                    {getStatusBadge(task.status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Target Quantity</p>
                      <p className="font-medium">{task.targetQuantity} units</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Completed</p>
                      <p className="font-medium">{task.completedQuantity} units</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Progress</p>
                      <p className="font-medium">{getProgressPercentage(task.completedQuantity, task.targetQuantity)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Submitted</p>
                      <p className="font-medium">{new Date(task.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {task.submissionNotes && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Employee Notes:</p>
                      <p className="text-sm">{task.submissionNotes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedTask(task);
                            setPartialQuantity(task.completedQuantity);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Review Task</DialogTitle>
                        </DialogHeader>
                        
                        {selectedTask && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <Label>Employee</Label>
                                <p>{selectedTask.employeeName}</p>
                              </div>
                              <div>
                                <Label>Product</Label>
                                <p>{selectedTask.productName}</p>
                              </div>
                              <div>
                                <Label>Stage</Label>
                                <p>{selectedTask.stageName}</p>
                              </div>
                              <div>
                                <Label>Target</Label>
                                <p>{selectedTask.targetQuantity} units</p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="approvedQuantity">Approved Quantity</Label>
                              <Input
                                id="approvedQuantity"
                                type="number"
                                min={0}
                                max={selectedTask.completedQuantity}
                                value={partialQuantity}
                                onChange={(e) => setPartialQuantity(parseInt(e.target.value) || 0)}
                              />
                              <p className="text-xs text-muted-foreground">
                                Employee completed: {selectedTask.completedQuantity} units
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="reviewNotes">Review Notes</Label>
                              <Textarea
                                id="reviewNotes"
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder="Add review comments..."
                                rows={3}
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleApprove(selectedTask.id, partialQuantity)}
                                className="flex-1 bg-success hover:bg-success/90"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleReject(selectedTask.id, reviewNotes)}
                                disabled={!reviewNotes.trim()}
                                className="flex-1"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button
                      onClick={() => handleApprove(task.id)}
                      size="sm"
                      className="bg-success hover:bg-success/90"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Quick Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          {reviewedTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No reviewed tasks</p>
              </CardContent>
            </Card>
          ) : (
            reviewedTasks.map((task) => (
              <Card key={task.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{task.productName} - {task.stageName}</CardTitle>
                      <p className="text-sm text-muted-foreground">Employee: {task.employeeName}</p>
                    </div>
                    {getStatusBadge(task.status)}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Target</p>
                      <p className="font-medium">{task.targetQuantity} units</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Completed</p>
                      <p className="font-medium">{task.completedQuantity} units</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Progress</p>
                      <p className="font-medium">{getProgressPercentage(task.completedQuantity, task.targetQuantity)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};