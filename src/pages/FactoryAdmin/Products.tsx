import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Settings, Eye, Edit } from 'lucide-react';
import { TenantHeader } from '@/components/layout/TenantHeader';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ProductForm } from '@/components/forms/ProductForm';
import { StageManagerForm } from '@/components/forms/StageManagerForm';
import { Product, ProcessStage } from '@/types';

// Mock data
const mockProducts: Product[] = [
  {
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
  },
  {
    id: '2',
    tenantId: 'tenant1',
    name: 'Steel Pipe B200',
    description: 'Seamless steel pipe for industrial applications',
    isActive: true,
    createdAt: '2024-01-12T14:30:00Z',
    stages: [
      { id: 's4', productId: '2', name: 'Forming', description: 'Shape the pipe', order: 1, isActive: true },
      { id: 's5', productId: '2', name: 'Assembly', description: 'Assemble components', order: 2, isActive: true }
    ]
  },
  {
    id: '3',
    tenantId: 'tenant1',
    name: 'Steel Frame C300',
    description: 'Custom steel frame for specialized equipment',
    isActive: false,
    createdAt: '2024-01-08T09:15:00Z',
    stages: [
      { id: 's6', productId: '3', name: 'Preparation', description: 'Prepare materials', order: 1, isActive: true },
      { id: 's7', productId: '3', name: 'Assembly', description: 'Assemble frame', order: 2, isActive: true },
      { id: 's8', productId: '3', name: 'Finishing', description: 'Apply coating', order: 3, isActive: true }
    ]
  }
];

export const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactiveProducts, setShowInactiveProducts] = useState(false);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = showInactiveProducts || product.isActive;
    return matchesSearch && matchesStatus;
  });

  const handleStagesUpdate = (productId: string, updatedStages: ProcessStage[]) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, stages: updatedStages }
        : product
    ));
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-base">{product.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={product.isActive ? "default" : "secondary"}>
              {product.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Process Stages ({product.stages.length})</h4>
          <div className="space-y-2">
            {product.stages.slice(0, 3).map((stage, index) => (
              <div key={stage.id} className="flex items-center gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {index + 1}
                </span>
                <span>{stage.name}</span>
              </div>
            ))}
            {product.stages.length > 3 && (
              <div className="text-sm text-muted-foreground ml-9">
                +{product.stages.length - 3} more stages
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate(`/products/${product.id}`)}
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
          <ProductForm>
            <Button size="sm" variant="outline" className="flex-1">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </ProductForm>
          <StageManagerForm
            productId={product.id}
            stages={product.stages}
            onStagesUpdate={(stages) => handleStagesUpdate(product.id, stages)}
          >
            <Button size="sm" variant="outline">
              <Settings className="w-4 h-4" />
            </Button>
          </StageManagerForm>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MobileLayout>
      <TenantHeader />
      
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-hero">Products</h1>
            <p className="text-muted-foreground mt-1">Manage your factory products and processes</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={showInactiveProducts ? "default" : "outline"}
              size="sm"
              onClick={() => setShowInactiveProducts(!showInactiveProducts)}
            >
              {showInactiveProducts ? 'Show All' : 'Show Inactive'}
            </Button>
          </div>
        </div>

        {/* Add Product Button */}
        <ProductForm>
          <Button className="w-full h-auto p-4">
            <Plus className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Add New Product</p>
              <p className="text-sm opacity-90">Create a new product with process stages</p>
            </div>
          </Button>
        </ProductForm>

        {/* Products List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-section">
              Products ({filteredProducts.length})
            </h2>
          </div>

          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-muted-foreground">
                  {searchTerm ? (
                    <>
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No products found matching "{searchTerm}"</p>
                    </>
                  ) : (
                    <>
                      <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No products created yet</p>
                      <p className="text-sm">Create your first product to get started</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};