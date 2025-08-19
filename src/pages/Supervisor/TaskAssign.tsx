import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { UserPlus, Package, CalendarIcon, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUsers, useProducts, useCreateTask } from '@/hooks/useApi';
import { useAuthStore } from '@/stores/auth';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Employee {
  id: string;
  name: string;
  email: string;
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

export const TaskAssignPage = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { data: usersData } = useUsers(1, 100);
  const { data: productsData } = useProducts(1, 100);
  const createTaskMutation = useCreateTask();

  // Filter employees and products for current tenant
  const employees = usersData?.data?.filter((u: any) => u.role === 'employee') || [];
  const products = productsData?.data || [];

  
  

  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [targetQuantity, setTargetQuantity] = useState<number>(1);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState<string>('');

  const selectedProductData = products.find((p: any) => p.id === selectedProduct);
  const selectedEmployeeData = employees.find((e: any) => e.id === selectedEmployee);

  const handleAssignTask = async () => {

    if (!selectedEmployee || !selectedProduct || !selectedStage || targetQuantity <= 0 || !deadline) {
      const missingFields = [];
      if (!selectedEmployee) missingFields.push('Employee');
      if (!selectedProduct) missingFields.push('Product');
      if (!selectedStage) missingFields.push('Process Stage');
      if (targetQuantity <= 0) missingFields.push('Target Quantity');
      if (!deadline) missingFields.push('Deadline');

      toast({ 
        title: 'Missing Information', 
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: 'destructive' 
      });
      return;
    }

    try {
      const taskData = {
        employeeId: selectedEmployee,
        productId: selectedProduct,
        processStageId: selectedStage,
        targetQty: targetQuantity,
        deadlineWeek: format(deadline, 'yyyy-\'W\'II'), // Generate week format from date
        deadline: deadline.toISOString(),
        notes,
      };

      await createTaskMutation.mutateAsync(taskData);
      
      // Get employee name for notification
      const employeeName = selectedEmployeeData?.name || employees.find((e: any) => (e.id || e._id) === selectedEmployee)?.name || 'Employee';
      
      toast({ 
        title: 'Task Assigned Successfully',
        description: `Task assigned to ${employeeName}`
      });

      // Reset form
      setSelectedEmployee('');
      setSelectedProduct('');
      setSelectedStage('');
      setTargetQuantity(1);
      setDeadline(undefined);
      setNotes('');
    } catch (error) {
      console.error('Failed to assign task:', error);
      toast({
        title: 'Task Assignment Failed',
        description: 'Failed to assign task. Please try again.',
        variant: 'destructive'
      });
    }
  };



  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex items-center gap-2">
        <UserPlus className="h-6 w-6" />
        <h1 className="text-hero">Assign Task</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Task Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleAssignTask(); }} className="space-y-6">
            {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employee">Select Employee *</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.length === 0 ? (
                  <div className="p-2 text-center text-muted-foreground">
                    No employees found
                  </div>
                ) : (
                  employees.map((employee: any) => (
                    <SelectItem key={employee.id || employee._id} value={employee.id || employee._id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{employee.name} ({employee.autoId})</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          Employee
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Product Selection */}
          <div className="space-y-2">
            <Label htmlFor="product">Select Product *</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product: any) => (
                  <SelectItem key={product.id} value={product.id}>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {product.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Process Stage Selection */}
          {selectedProductData && (
            <div className="space-y-2">
              <Label htmlFor="stage">Select Process Stage *</Label>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a process stage" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProductData.stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      <div>
                        <div className="font-medium">{stage.name}</div>
                        <div className="text-sm text-muted-foreground">{stage.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Target Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Target Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={targetQuantity}
              onChange={(e) => setTargetQuantity(parseInt(e.target.value) || 1)}
              placeholder="Enter target quantity"
            />
          </div>

          {/* Deadline Date */}
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : "Select deadline date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional instructions or notes..."
              rows={3}
            />
          </div>

          {/* Assignment Summary */}
          {selectedEmployee && selectedProduct && selectedStage && deadline && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Assignment Summary
              </h4>
              <div className="text-sm space-y-1">
                <p><strong>Employee:</strong> {selectedEmployeeData?.name}</p>
                <p><strong>Product:</strong> {selectedProductData?.name}</p>
                <p><strong>Stage:</strong> {selectedProductData?.stages.find(s => s.id === selectedStage)?.name}</p>
                <p><strong>Quantity:</strong> {targetQuantity} units</p>
                <p><strong>Deadline:</strong> {format(deadline, "PPP")}</p>
              </div>
            </div>
          )}

          <Button 
            type="submit"
            className="w-full bg-success hover:bg-success/90 tap-target"
            disabled={!selectedEmployee || !selectedProduct || !selectedStage || targetQuantity <= 0 || !deadline}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Task
          </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};