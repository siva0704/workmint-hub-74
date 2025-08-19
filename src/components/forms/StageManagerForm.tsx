import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, GripVertical, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProcessStage } from '@/types';

const stageSchema = z.object({
  name: z.string().min(2, 'Stage name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
});

type StageFormData = z.infer<typeof stageSchema>;

interface StageManagerFormProps {
  children: React.ReactNode;
  productId: string;
  stages: ProcessStage[];
  onStagesUpdate?: (stages: ProcessStage[]) => void;
}

export const StageManagerForm = ({ children, productId, stages: initialStages, onStagesUpdate }: StageManagerFormProps) => {
  const [open, setOpen] = useState(false);
  const [stages, setStages] = useState<ProcessStage[]>(initialStages || []);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<StageFormData>({
    resolver: zodResolver(stageSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const handleAddStage = async (data: StageFormData) => {
    setIsLoading(true);
    try {
      const newStage: ProcessStage = {
        id: `stage_${Date.now()}`,
        productId,
        name: data.name,
        description: data.description,
        order: stages.length + 1,
        isActive: true
      };

      const updatedStages = [...stages, newStage];
      setStages(updatedStages);
      onStagesUpdate?.(updatedStages);
      
      toast({
        title: 'Stage added',
        description: `${data.name} has been added to the process.`,
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add stage. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStageStatus = (stageId: string) => {
    const updatedStages = stages.map(stage =>
      stage.id === stageId ? { ...stage, isActive: !stage.isActive } : stage
    );
    setStages(updatedStages);
    onStagesUpdate?.(updatedStages);
    
    const stage = stages.find(s => s.id === stageId);
    toast({
      title: 'Stage updated',
      description: `${stage?.name} is now ${stage?.isActive ? 'inactive' : 'active'}.`,
    });
  };

  const removeStage = (stageId: string) => {
    const updatedStages = stages.filter(stage => stage.id !== stageId);
    setStages(updatedStages);
    onStagesUpdate?.(updatedStages);
    
    toast({
      title: 'Stage removed',
      description: 'The stage has been removed from the process.',
    });
  };

  const moveStage = (stageId: string, direction: 'up' | 'down') => {
    const stageIndex = stages.findIndex(s => s.id === stageId);
    if (
      (direction === 'up' && stageIndex === 0) ||
      (direction === 'down' && stageIndex === stages.length - 1)
    ) {
      return;
    }

    const newStages = [...stages];
    const targetIndex = direction === 'up' ? stageIndex - 1 : stageIndex + 1;
    
    [newStages[stageIndex], newStages[targetIndex]] = [newStages[targetIndex], newStages[stageIndex]];
    
    // Update order numbers
    newStages.forEach((stage, index) => {
      stage.order = index + 1;
    });
    
    setStages(newStages);
    onStagesUpdate?.(newStages);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Process Stages</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Stages */}
          <div className="space-y-3">
            <h3 className="font-medium">Current Stages ({stages.length})</h3>
            {stages.length > 0 ? (
              <div className="space-y-2">
                {stages.map((stage, index) => (
                  <Card key={`${stage.id}-${index}`}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveStage(stage.id, 'up')}
                            disabled={index === 0}
                            className="h-4 w-4 p-0"
                          >
                            ↑
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveStage(stage.id, 'down')}
                            disabled={index === stages.length - 1}
                            className="h-4 w-4 p-0"
                          >
                            ↓
                          </Button>
                        </div>
                        
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {stage.order}
                        </span>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{stage.name}</h4>
                            <Badge variant={stage.isActive ? "default" : "secondary"}>
                              {stage.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{stage.description}</p>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleStageStatus(stage.id)}
                          >
                            {stage.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeStage(stage.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No stages defined yet</p>
                <p className="text-sm">Add your first process stage below</p>
              </div>
            )}
          </div>

          {/* Add New Stage Form */}
          <div className="border-t pt-6">
            <h3 className="font-medium mb-4">Add New Stage</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddStage)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stage Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Cutting, Welding, Assembly" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what happens in this stage"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isLoading ? 'Adding...' : 'Add Stage'}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};