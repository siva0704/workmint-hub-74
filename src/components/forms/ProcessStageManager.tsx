import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GripVertical, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { ProcessStage } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ProcessStageManagerProps {
  productId: string;
  stages: ProcessStage[];
  onStagesUpdate: (stages: ProcessStage[]) => void;
  children: React.ReactNode;
}

interface StageFormData {
  name: string;
  description: string;
}

export const ProcessStageManager = ({ productId, stages, onStagesUpdate, children }: ProcessStageManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<ProcessStage | null>(null);
  const [formData, setFormData] = useState<StageFormData>({ name: '', description: '' });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingStage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Stage name is required',
        variant: 'destructive',
      });
      return;
    }

    if (editingStage) {
      const updatedStages = stages.map(stage =>
        stage.id === editingStage.id
          ? { ...stage, name: formData.name, description: formData.description }
          : stage
      );
      onStagesUpdate(updatedStages);
      toast({
        title: 'Success',
        description: 'Stage updated successfully',
      });
    } else {
      const newStage: ProcessStage = {
        id: `stage_${Date.now()}`,
        productId,
        name: formData.name,
        description: formData.description,
        order: stages.length + 1,
        isActive: true,
      };
      onStagesUpdate([...stages, newStage]);
      toast({
        title: 'Success',
        description: 'Stage added successfully',
      });
    }

    resetForm();
  };

  const handleEdit = (stage: ProcessStage) => {
    setEditingStage(stage);
    setFormData({ name: stage.name, description: stage.description });
  };

  const handleDelete = (stageId: string) => {
    const updatedStages = stages
      .filter(stage => stage.id !== stageId)
      .map((stage, index) => ({ ...stage, order: index + 1 }));
    onStagesUpdate(updatedStages);
    toast({
      title: 'Success',
      description: 'Stage deleted successfully',
    });
  };

  const handleToggleActive = (stageId: string) => {
    const updatedStages = stages.map(stage =>
      stage.id === stageId ? { ...stage, isActive: !stage.isActive } : stage
    );
    onStagesUpdate(updatedStages);
    toast({
      title: 'Success',
      description: 'Stage status updated',
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation();
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const reorderedStages = [...stages];
    const [draggedStage] = reorderedStages.splice(draggedIndex, 1);
    reorderedStages.splice(dropIndex, 0, draggedStage);

    const updatedStages = reorderedStages.map((stage, index) => ({
      ...stage,
      order: index + 1,
    }));

    onStagesUpdate(updatedStages);
    setDraggedIndex(null);

    // Ensure the dialog remains open and focused after drop
    setIsOpen(true);

    toast({
      title: 'Success',
      description: 'Stages reordered successfully',
    });
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedIndex(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Process Stages</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add/Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {editingStage ? 'Edit Stage' : 'Add New Stage'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="stageName">Stage Name</Label>
                  <Input
                    id="stageName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Cutting, Welding, Assembly"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="stageDescription">Description</Label>
                  <Textarea
                    id="stageDescription"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what happens in this stage"
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingStage ? 'Update Stage' : 'Add Stage'}
                  </Button>
                  {editingStage && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Existing Stages */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Current Stages</CardTitle>
                <Badge variant="outline">{stages.length} stages</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {stages.length > 0 ? (
                <div className="space-y-2">
                  {stages
                    .sort((a, b) => a.order - b.order)
                    .map((stage, index) => (
                      <div
                        key={stage.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-background cursor-move hover:bg-muted/50 transition-colors"
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">
                          {stage.order}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{stage.name}</h4>
                            <Badge variant={stage.isActive ? "default" : "secondary"} className="text-xs">
                              {stage.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{stage.description}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleActive(stage.id)}
                          >
                            {stage.isActive ? (
                              <ToggleRight className="w-4 h-4" />
                            ) : (
                              <ToggleLeft className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(stage)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(stage.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No process stages defined</p>
                  <p className="text-sm">Add your first process stage above</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
