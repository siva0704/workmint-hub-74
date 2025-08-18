
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle } from 'lucide-react';

const taskReviewSchema = z.object({
  action: z.enum(['confirm', 'reject']),
  reason: z.string().optional(),
});

type TaskReviewFormData = z.infer<typeof taskReviewSchema>;

interface TaskReviewFormProps {
  children: React.ReactNode;
  taskId?: string;
  taskName?: string;
  completedQty?: number;
  targetQty?: number;
  onSubmit?: (data: TaskReviewFormData & { taskId: string }) => void;
}

export const TaskReviewForm = ({ 
  children, 
  taskId = '1', 
  taskName = 'Sample Task',
  completedQty = 45,
  targetQty = 60,
  onSubmit 
}: TaskReviewFormProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'confirm' | 'reject' | null>(null);
  const { toast } = useToast();

  const form = useForm<TaskReviewFormData>({
    resolver: zodResolver(taskReviewSchema),
    defaultValues: {
      action: 'confirm',
      reason: '',
    },
  });

  const handleSubmit = async (data: TaskReviewFormData) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log('Reviewing task:', { ...data, taskId });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSubmit?.({ ...data, taskId });
      toast({
        title: data.action === 'confirm' ? 'Task confirmed' : 'Task rejected',
        description: `${taskName} has been ${data.action === 'confirm' ? 'confirmed' : 'rejected'}.`,
      });
      
      form.reset();
      setOpen(false);
      setSelectedAction(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to review task. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionSelect = (action: 'confirm' | 'reject') => {
    setSelectedAction(action);
    form.setValue('action', action);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh]">
        <SheetHeader>
          <SheetTitle>Review Task</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          {/* Task Details */}
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-slate-900 mb-2">{taskName}</h3>
            <p className="text-sm text-slate-600">
              Completed: {completedQty}/{targetQty} units ({Math.round((completedQty / targetQty) * 100)}%)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              type="button"
              variant={selectedAction === 'confirm' ? 'default' : 'outline'}
              onClick={() => handleActionSelect('confirm')}
              className={selectedAction === 'confirm' 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'border-emerald-600 text-emerald-600 hover:bg-emerald-50'
              }
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm
            </Button>
            <Button
              type="button"
              variant={selectedAction === 'reject' ? 'destructive' : 'outline'}
              onClick={() => handleActionSelect('reject')}
              className={selectedAction === 'reject' 
                ? '' 
                : 'border-red-600 text-red-600 hover:bg-red-50'
              }
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {selectedAction === 'reject' && (
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Rejection</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide a reason for rejecting this task"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !selectedAction}
                  className="flex-1"
                >
                  {isLoading ? 'Processing...' : 'Submit Review'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};
