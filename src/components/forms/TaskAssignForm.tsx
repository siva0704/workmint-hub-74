
import { useState } from 'react';
import { useCreateTask, useUsers, useProducts } from '@/hooks/useApi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { format, addDays } from 'date-fns';

const taskAssignSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  productId: z.string().min(1, 'Product is required'),
  processStageId: z.string().min(1, 'Process stage is required'),
  targetQty: z.number().min(1, 'Target quantity must be at least 1'),
  deadline: z.string().min(1, 'Deadline is required'),
  notes: z.string().optional(),
});

type TaskAssignFormData = z.infer<typeof taskAssignSchema>;

interface TaskAssignFormProps {
  children: React.ReactNode;
  onSubmit?: (data: TaskAssignFormData) => void;
}

export const TaskAssignForm = ({ children, onSubmit }: TaskAssignFormProps) => {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuthStore();
  
  const createTaskMutation = useCreateTask();
  const { data: usersData } = useUsers(1, 100);
  const { data: productsData } = useProducts(1, 100);
  
  const isLoading = createTaskMutation.isPending;
  const employees = usersData?.data?.filter((u: any) => u.role === 'employee') || [];
  const products = productsData?.data || [];

  const form = useForm<TaskAssignFormData>({
    resolver: zodResolver(taskAssignSchema),
    defaultValues: {
      employeeId: '',
      productId: '',
      processStageId: '',
      targetQty: 1,
      deadline: '',
      notes: '',
    },
  });

  // Role-based access control
  const canAssignTasks = user?.role === 'supervisor' || user?.role === 'factory_admin';

  if (!canAssignTasks) {
    return null; // Don't render if user can't assign tasks
  }

  const handleSubmit = async (data: TaskAssignFormData) => {
    try {
      const taskData = {
        ...data,
        targetQty: Number(data.targetQty),
        deadline: new Date(data.deadline).toISOString(),
        deadlineWeek: format(new Date(data.deadline), 'yyyy-\'W\'II'),
      };

      await createTaskMutation.mutateAsync(taskData);
      
      onSubmit?.(data);
      
      form.reset();
      setSelectedProduct(null);
      setOpen(false);
    } catch (error) {
      console.error('Task assignment error:', error);
    }
  };

  const handleProductChange = (productId: string) => {
    const product = products.find((p: any) => (p.id || p._id) === productId);
    setSelectedProduct(product);
    form.setValue('productId', productId);
    form.setValue('processStageId', ''); // Reset stage selection
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh]">
        <SheetHeader>
          <SheetTitle>Assign New Task</SheetTitle>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-6">
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((employee: any) => (
                        <SelectItem key={employee.id || employee._id} value={employee.id || employee._id}>
                          {employee.name} ({employee.autoId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select onValueChange={handleProductChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product: any) => (
                        <SelectItem key={product.id || product._id} value={product.id || product._id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedProduct && (
              <FormField
                control={form.control}
                name="processStageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Process Stage</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select process stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedProduct.stages?.map((stage: any) => (
                          <SelectItem key={stage.id || stage._id} value={stage.id || stage._id}>
                            {stage.order}. {stage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="targetQty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Enter target quantity"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      min={format(new Date(), 'yyyy-MM-dd')}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional instructions or notes"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                disabled={isLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? 'Assigning...' : 'Assign Task'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
