
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Send, Users, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/types';

interface TaskEscalationFormProps {
  overdueTasks: Task[];
  onClose: () => void;
}

export const TaskEscalationForm = ({ overdueTasks, onClose }: TaskEscalationFormProps) => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const defaultMessage = `Hello! You have overdue tasks that need immediate attention. Please update your progress or contact your supervisor if you need assistance.`;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(overdueTasks.map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleTaskSelection = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleSendNudges = async () => {
    if (selectedTasks.length === 0) {
      toast({
        title: 'No tasks selected',
        description: 'Please select at least one task to send nudges.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: API call to send bulk nudges
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: 'Nudges sent successfully',
        description: `Sent reminders for ${selectedTasks.length} overdue tasks.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Failed to send nudges',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysOverdue = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = today.getTime() - deadlineDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const groupedTasks = overdueTasks.reduce((acc, task) => {
    const employee = task.employeeName;
    if (!acc[employee]) {
      acc[employee] = [];
    }
    acc[employee].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Task Escalation & Bulk Nudges
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Send reminders to employees with overdue tasks
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">
                {overdueTasks.length}
              </div>
              <div className="text-sm text-muted-foreground">Overdue Tasks</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {Object.keys(groupedTasks).length}
              </div>
              <div className="text-sm text-muted-foreground">Employees</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {selectedTasks.length}
              </div>
              <div className="text-sm text-muted-foreground">Selected</div>
            </CardContent>
          </Card>
        </div>

        {/* Task Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Select Tasks</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedTasks.length === overdueTasks.length}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="text-sm">
                Select All
              </Label>
            </div>
          </div>

          <div className="space-y-4 max-h-64 overflow-y-auto">
            {Object.entries(groupedTasks).map(([employeeName, tasks]) => (
              <div key={employeeName} className="space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <Users className="h-4 w-4" />
                  <span>{employeeName}</span>
                  <Badge variant="secondary">{tasks.length} tasks</Badge>
                </div>
                
                <div className="ml-6 space-y-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={task.id}
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={(checked) => handleTaskSelection(task.id, checked as boolean)}
                        />
                        <div>
                          <Label htmlFor={task.id} className="text-sm font-medium">
                            {task.processStageeName}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {task.productName} • {task.completedQty}/{task.targetQty}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-warning">
                          <Clock className="h-3 w-3" />
                          {getDaysOverdue(task.deadline)} days overdue
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          {Math.round(task.progress)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="message">Reminder Message</Label>
          <Textarea
            id="message"
            value={message || defaultMessage}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your reminder message..."
            rows={4}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendNudges}
            disabled={isLoading || selectedTasks.length === 0}
            className="flex-1"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Sending...' : `Send Nudges (${selectedTasks.length})`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
