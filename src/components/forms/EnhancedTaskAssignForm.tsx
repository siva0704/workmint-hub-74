import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WeekPicker } from '@/components/ui/week-picker';
import { Badge } from '@/components/ui/badge';
import { User, Save, Target, Calendar, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCreateTask } from '@/hooks/useApi';
import { format } from 'date-fns';

const taskAssignSchema = z.object({
  employeeId: z.string().min(1, 'Please select an employee'),
  productId: z.string().min(1, 'Please select a product'),
  processStageId: z.string().min(1, 'Please select a process stage'),
  targetQty: z.number().min(1, 'Target quantity must be at least 1'),
  deadlineWeek: z.date(),
  notes: z.string().optional(),
});

type TaskAssignFormData = z.infer<typeof taskAssignSchema>;

interface Employee {
  id: string;
  name: string;
  autoId: string;
  currentTasks: number;
}

interface Product {
  id: string;
  name: string;
  stages: ProcessStage[];
}

interface ProcessStage {
  id: string;
  name: string;
  description: string;
  order: number;
}

// Mock data - replace with API calls
const mockEmployees: Employee[] = [
  { id: '1', name: 'John Smith', autoId: 'EMP001', currentTasks: 3 },
  { id: '2', name: 'Jane Doe', autoId: 'EMP002', currentTasks: 2 },
  { id: '3', name: 'Mike Johnson', autoId: 'EMP003', currentTasks: 4 },
];

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Steel Beam A100',
    stages: [
      { id: 's1', name: 'Cutting', description: 'Cut raw materials', order: 1 },
      { id: 's2', name: 'Welding', description: 'Weld components', order: 2 },
      { id: 's3', name: 'Quality Check', description: 'Final inspection', order: 3 },
    ],
  },
  {
    id: '2',
    name: 'Aluminum Frame B200',
    stages: [
      { id: 's4', name: 'Cutting', description: 'Cut aluminum pieces', order: 1 },
      { id: 's5', name: 'Assembly', description: 'Assemble frame', order: 2 },
      { id: 's6', name: 'Finishing', description: 'Surface treatment', order: 3 },
    ],
  },
];

export const EnhancedTaskAssignForm = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();
  const createTaskMutation = useCreateTask();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TaskAssignFormData>({
    resolver: zodResolver(taskAssignSchema),
  });

  const watchedEmployeeId = watch('employeeId');
  const watchedProductId = watch('productId');

  const onSubmit = async (data: TaskAssignFormData) => {
    try {
      const taskData = {
        ...data,
        deadlineWeek: format(data.deadlineWeek, 'yyyy-\'W\'II'),
        deadline: data.deadlineWeek.toISOString(),
        assignedBy: 'current-supervisor-id', // Get from auth
        tenantId: 'current-tenant-id', // Get from auth
      };

      await createTaskMutation.mutateAsync(taskData);
      reset();
      setSelectedProduct(null);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Failed to assign task:', error);
    }
  };

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = mockEmployees.find(e => e.id === employeeId);
    setSelectedEmployee(employee || null);
    setValue('employeeId', employeeId);
  };

  const handleProductSelect = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    setSelectedProduct(product || null);
    setValue('productId', productId);
    setValue('processStageId', ''); // Reset stage selection
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Assign New Task</h1>
          <p className="text-muted-foreground">Create and assign a task to an employee</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employee Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Select Employee
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee</Label>
                <Select onValueChange={handleEmployeeSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{employee.name} ({employee.autoId})</span>
                          <Badge variant="secondary" className="ml-2">
                            {employee.currentTasks} tasks
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.employeeId && (
                  <p className="text-sm text-destructive">{errors.employeeId.message}</p>
                )}
              </div>

              {selectedEmployee && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedEmployee.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {selectedEmployee.autoId}</p>
                    </div>
                    <Badge variant={selectedEmployee.currentTasks > 5 ? "destructive" : "default"}>
                      {selectedEmployee.currentTasks} active tasks
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product & Process Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Product & Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productId">Product</Label>
                <Select onValueChange={handleProductSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productId && (
                  <p className="text-sm text-destructive">{errors.productId.message}</p>
                )}
              </div>

              {selectedProduct && (
                <div className="space-y-2">
                  <Label htmlFor="processStageId">Process Stage</Label>
                  <Select onValueChange={(value) => setValue('processStageId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a process stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProduct.stages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          <div>
                            <div className="font-medium">
                              {stage.order}. {stage.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {stage.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.processStageId && (
                    <p className="text-sm text-destructive">{errors.processStageId.message}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Task Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Task Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetQty">Target Quantity</Label>
                <Input
                  id="targetQty"
                  type="number"
                  min="1"
                  placeholder="Enter target quantity"
                  {...register('targetQty', { valueAsNumber: true })}
                />
                {errors.targetQty && (
                  <p className="text-sm text-destructive">{errors.targetQty.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Deadline Week</Label>
                <WeekPicker
                  onChange={(date) => setValue('deadlineWeek', date)}
                  placeholder="Select deadline week"
                />
                {errors.deadlineWeek && (
                  <p className="text-sm text-destructive">{errors.deadlineWeek.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional instructions or notes..."
                {...register('notes')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isSubmitting || createTaskMutation.isPending}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting || createTaskMutation.isPending ? 'Assigning Task...' : 'Assign Task'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              setSelectedProduct(null);
              setSelectedEmployee(null);
            }}
          >
            Clear Form
          </Button>
        </div>
      </form>
    </div>
  );
};