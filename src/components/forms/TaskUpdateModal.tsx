
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Save, Clock, Target } from 'lucide-react';
import { useUpdateTaskProgress } from '@/hooks/useApi';
import { Task } from '@/types';

interface TaskUpdateModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskUpdateModal = ({ task, isOpen, onClose }: TaskUpdateModalProps) => {
  const [completedQty, setCompletedQty] = useState(task.completedQty);
  const [notes, setNotes] = useState('');
  
  const updateMutation = useUpdateTaskProgress();

  const progress = Math.min((completedQty / task.targetQty) * 100, 100);
  const isOverdue = new Date(task.deadline) < new Date();

  const handleSave = () => {
    updateMutation.mutate(
      { taskId: task.id, completedQty },
      { onSuccess: onClose }
    );
  };

  const canUpdate = completedQty !== task.completedQty && completedQty >= 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Update Task Progress
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{task.processStageeName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Product: {task.productName}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={task.status === 'overdue' ? 'destructive' : 'secondary'}
                  >
                    {task.status}
                  </Badge>
                  {isOverdue && (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Deadline</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {new Date(task.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Update */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetQty">Target Quantity</Label>
              <Input
                id="targetQty"
                value={task.targetQty}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="completedQty">Completed Quantity</Label>
              <Input
                id="completedQty"
                type="number"
                min={0}
                max={task.targetQty}
                value={completedQty}
                onChange={(e) => setCompletedQty(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about the progress..."
              rows={3}
            />
          </div>

          {/* Rejection Info */}
          {task.status === 'rejected' && task.rejectionReason && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      Task was rejected
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.rejectionReason}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!canUpdate || updateMutation.isPending}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? 'Saving...' : 'Save Progress'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
