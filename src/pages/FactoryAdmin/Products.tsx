import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Settings, Eye, Edit } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ProductForm } from '@/components/forms/ProductForm';
import { ProcessStageManager } from '@/components/forms/ProcessStageManager';
import { Product, ProcessStage } from '@/types';
import { useProducts } from '@/hooks/useApi';
import { useAuthStore } from '@/stores/auth';

export const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactiveProducts, setShowInactiveProducts] = useState(false);
  const { user } = useAuthStore();

  // Fetch products from API
  const { data: productsData, refetch, isLoading } = useProducts(1, 100);
  
  // Role-based access control
  useEffect(() => {
    if (user?.role !== 'factory_admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (user?.role !== 'factory_admin') {
    return null;
  }

  const products = productsData?.data || [];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = showInactiveProducts || product.isActive;
    return matchesSearch && matchesStatus;
  });

  const handleStagesUpdate = (productId: string, updatedStages: ProcessStage[]) => {
    // Refetch products to get updated data
    refetch();
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
          <h4 className="text-sm font-medium mb-2">Process Stages ({product.stages?.length || 0})</h4>
          <div className="space-y-2">
            {product.stages?.slice(0, 3).map((stage, index) => (
              <div key={`${product.id}-${stage.id}`} className="flex items-center gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {index + 1}
                </span>
                <span>{stage.name}</span>
              </div>
            )) || []}
            {(product.stages?.length || 0) > 3 && (
              <div className="text-sm text-muted-foreground ml-9">
                +{(product.stages?.length || 0) - 3} more stages
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
          <ProductForm product={product} onSuccess={() => refetch()}>
            <Button size="sm" variant="outline" className="flex-1">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </ProductForm>
          <ProcessStageManager
            productId={product.id}
            stages={product.stages || []}
            onStagesUpdate={(stages) => handleStagesUpdate(product.id, stages)}
          >
            <Button size="sm" variant="outline">
              <Settings className="w-4 h-4" />
            </Button>
          </ProcessStageManager>
        </div>
      </CardContent>
    </Card>
  );

  return (
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
        <ProductForm onSuccess={() => refetch()}>
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

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
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
  );
};