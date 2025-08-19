import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, Search, Filter, Eye } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Task } from '@/types';
import { useTasks, useConfirmTask, useRejectTask } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';

export const TaskReviewPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [partialQuantity, setPartialQuantity] = useState(0);

  // Fetch tasks from API
  const { data: tasksData, refetch } = useTasks();
  const confirmTaskMutation = useConfirmTask();
  const rejectTaskMutation = useRejectTask();
  const { toast } = useToast();

  const tasks = tasksData?.data || [];
  const pendingTasks = tasks.filter((t: Task) => t.status === 'completed');
  const confirmedTasks = tasks.filter((t: Task) => t.status === 'confirmed');
  const rejectedTasks = tasks.filter((t: Task) => t.status === 'rejected');
  const reviewedTasks = [...confirmedTasks, ...rejectedTasks];

  const filteredTasks = (() => {
    const currentTasks = statusFilter === 'pending_review' ? pendingTasks : 
                        statusFilter === 'approved' ? confirmedTasks : 
                        statusFilter === 'rejected' ? rejectedTasks : tasks;
    
    return currentTasks.filter((task: Task) => 
      task.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.processStageeName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  })();

  const handleApprove = async (taskId: string, approvedQuantity?: number) => {
    try {
      await confirmTaskMutation.mutateAsync({ 
        taskId, 
        confirmedQty: approvedQuantity 
      });
      
      toast({ 
        title: 'Task Approved',
        description: 'Task has been confirmed successfully.'
      });
      
      setSelectedTask(null);
      setReviewNotes('');
      setPartialQuantity(0);
      refetch();
    } catch (error) {
      console.error('Error approving task:', error);
    }
  };

  const handleReject = async (taskId: string, reason: string) => {
    try {
      await rejectTaskMutation.mutateAsync({ taskId, reason });
      
      toast({ 
        title: 'Task Rejected',
        description: reason,
        variant: 'destructive'
      });
      
      setSelectedTask(null);
      setReviewNotes('');
      refetch();
    } catch (error) {
      console.error('Error rejecting task:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="border-yellow-200 text-yellow-800">Pending Review</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="border-green-200 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'active':
        return <Badge variant="secondary">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProgressPercentage = (completed: number, target: number) => {
    return Math.round((completed / target) * 100);
  };

  return (
    <MobileLayout>
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
                        <CardTitle className="text-lg">{task.productName} - {task.processStageeName}</CardTitle>
                        <p className="text-sm text-muted-foreground">Assigned to: {task.employeeName}</p>
                      </div>
                      {getStatusBadge(task.status)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Target Quantity</p>
                        <p className="font-medium">{task.targetQty} units</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completed</p>
                        <p className="font-medium">{task.completedQty} units</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Progress</p>
                        <p className="font-medium">{getProgressPercentage(task.completedQty, task.targetQty)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Deadline</p>
                        <p className="font-medium">{new Date(task.deadline).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {task.notes && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Notes:</p>
                        <p className="text-sm">{task.notes}</p>
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
                              setPartialQuantity(task.completedQty);
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
                                  <p>{selectedTask.processStageeName}</p>
                                </div>
                                <div>
                                  <Label>Target</Label>
                                  <p>{selectedTask.targetQty} units</p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="approvedQuantity">Approved Quantity</Label>
                                <Input
                                  id="approvedQuantity"
                                  type="number"
                                  min={0}
                                  max={selectedTask.completedQty}
                                  value={partialQuantity}
                                  onChange={(e) => setPartialQuantity(parseInt(e.target.value) || 0)}
                                />
                                <p className="text-xs text-muted-foreground">
                                  Employee completed: {selectedTask.completedQty} units
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
                                  className="flex-1 bg-green-600 hover:bg-green-700"
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
                        className="bg-green-600 hover:bg-green-700"
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
                        <CardTitle className="text-lg">{task.productName} - {task.processStageeName}</CardTitle>
                        <p className="text-sm text-muted-foreground">Employee: {task.employeeName}</p>
                      </div>
                      {getStatusBadge(task.status)}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Target</p>
                        <p className="font-medium">{task.targetQty} units</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completed</p>
                        <p className="font-medium">{task.completedQty} units</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Progress</p>
                        <p className="font-medium">{getProgressPercentage(task.completedQty, task.targetQty)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};