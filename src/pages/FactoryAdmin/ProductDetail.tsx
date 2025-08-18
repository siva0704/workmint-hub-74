import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Settings, Clock } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ProcessStageManager } from '@/components/forms/ProcessStageManager';
import { ProductForm } from '@/components/forms/ProductForm';
import { Product, ProcessStage } from '@/types';

// Mock data - in real app this would come from API
const mockProduct: Product = {
  id: '1',
  tenantId: 'tenant1',
  name: 'Steel Beam A100',
  description: 'High-strength structural steel beam for construction projects',
  isActive: true,
  createdAt: '2024-01-10T10:00:00Z',
  stages: [
    { id: 's1', productId: '1', name: 'Cutting', description: 'Cut raw materials to size', order: 1, isActive: true },
    { id: 's2', productId: '1', name: 'Welding', description: 'Weld components together', order: 2, isActive: true },
    { id: 's3', productId: '1', name: 'Quality Check', description: 'Final inspection', order: 3, isActive: true }
  ]
};

export const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product>(mockProduct);

  const handleStagesUpdate = (updatedStages: ProcessStage[]) => {
    setProduct(prev => ({ ...prev, stages: updatedStages }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/products')}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>

        {/* Product Info */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-xl">{product.name}</CardTitle>
                <p className="text-muted-foreground mt-2">{product.description}</p>
              </div>
              <Badge variant={product.isActive ? "default" : "secondary"}>
                {product.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Created: {formatDate(product.createdAt)}
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <ProductForm>
                <Button variant="outline" className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit Product
                </Button>
              </ProductForm>
              <ProcessStageManager
                productId={product.id}
                stages={product.stages}
                onStagesUpdate={handleStagesUpdate}
              >
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-1" />
                  Manage Stages
                </Button>
              </ProcessStageManager>
            </div>
          </CardContent>
        </Card>

        {/* Process Stages */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Process Stages</CardTitle>
              <Badge variant="outline">{product.stages.length} stages</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {product.stages.length > 0 ? (
              <div className="space-y-3">
                {product.stages.map((stage, index) => (
                  <div key={stage.id} className="flex items-start gap-4 p-3 border rounded-lg">
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No process stages defined</p>
                <p className="text-sm">Use "Manage Stages" to add process steps</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};
