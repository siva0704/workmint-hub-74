import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Package, Calendar, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const mockEmployees: Employee[] = [
  { id: 'emp1', name: 'John Worker', email: 'john@factory.com', currentTasks: 3 },
  { id: 'emp2', name: 'Sarah Builder', email: 'sarah@factory.com', currentTasks: 2 },
  { id: 'emp3', name: 'Mike Assembler', email: 'mike@factory.com', currentTasks: 1 },
];

const mockProducts: Product[] = [
  {
    id: 'prod1',
    name: 'Steel Frame',
    stages: [
      { id: 'stage1', name: 'Cutting', description: 'Cut steel to specifications', order: 1 },
      { id: 'stage2', name: 'Welding', description: 'Weld joints and connections', order: 2 },
      { id: 'stage3', name: 'Finishing', description: 'Sand and paint the frame', order: 3 },
    ]
  },
  {
    id: 'prod2',
    name: 'Motor Assembly',
    stages: [
      { id: 'stage4', name: 'Component Prep', description: 'Prepare motor components', order: 1 },
      { id: 'stage5', name: 'Assembly', description: 'Assemble motor parts', order: 2 },
      { id: 'stage6', name: 'Testing', description: 'Test motor functionality', order: 3 },
    ]
  },
];

export const TaskAssignPage = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [targetQuantity, setTargetQuantity] = useState<number>(1);
  const [deadlineWeek, setDeadlineWeek] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const { toast } = useToast();

  const selectedProductData = mockProducts.find(p => p.id === selectedProduct);
  const selectedEmployeeData = mockEmployees.find(e => e.id === selectedEmployee);

  const handleAssignTask = () => {
    if (!selectedEmployee || !selectedProduct || !selectedStage || !targetQuantity || !deadlineWeek) {
      toast({ 
        title: 'Missing Information', 
        description: 'Please fill in all required fields',
        variant: 'destructive' 
      });
      return;
    }

    // TODO: API call to assign task
    toast({ 
      title: 'Task Assigned Successfully',
      description: `Task assigned to ${selectedEmployeeData?.name}`
    });

    // Reset form
    setSelectedEmployee('');
    setSelectedProduct('');
    setSelectedStage('');
    setTargetQuantity(1);
    setDeadlineWeek('');
    setNotes('');
  };

  const getCurrentWeek = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  };

  const generateWeekOptions = () => {
    const currentWeek = getCurrentWeek();
    const options = [];
    
    for (let i = 0; i < 8; i++) {
      const weekNumber = currentWeek + i;
      const weekLabel = i === 0 ? 'This Week' : i === 1 ? 'Next Week' : `Week ${weekNumber}`;
      options.push({
        value: `2024-W${weekNumber.toString().padStart(2, '0')}`,
        label: weekLabel
      });
    }
    
    return options;
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
        <CardContent className="space-y-6">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employee">Select Employee *</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an employee" />
              </SelectTrigger>
              <SelectContent>
                {mockEmployees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{employee.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({employee.currentTasks} active tasks)
                      </span>
                    </div>
                  </SelectItem>
                ))}
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
                {mockProducts.map((product) => (
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

          {/* Deadline Week */}
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline Week *</Label>
            <Select value={deadlineWeek} onValueChange={setDeadlineWeek}>
              <SelectTrigger>
                <SelectValue placeholder="Select deadline week" />
              </SelectTrigger>
              <SelectContent>
                {generateWeekOptions().map((week) => (
                  <SelectItem key={week.value} value={week.value}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {week.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          {selectedEmployee && selectedProduct && selectedStage && (
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
                <p><strong>Deadline:</strong> {deadlineWeek}</p>
              </div>
            </div>
          )}

          <Button 
            onClick={handleAssignTask}
            className="w-full bg-success hover:bg-success/90 tap-target"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Task
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};