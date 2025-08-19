
import { useState } from 'react';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useApi';
import type { Product } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  children: React.ReactNode;
  product?: Product; // if provided, acts as edit form
  onSubmit?: (data: ProductFormData) => void;
  onSuccess?: () => void; // optional callback after API success
}

export const ProductForm = ({ children, product, onSubmit, onSuccess }: ProductFormProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
    },
  });

  // Keep form values in sync when opening as edit form
  const isEdit = Boolean(product);
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (data: ProductFormData) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ productId: product!.id, productData: data });
      } else {
        await createMutation.mutateAsync(data);
      }

      onSubmit?.(data);
      onSuccess?.();
      
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Product form error:', error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh]">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Product' : 'Add New Product'}</SheetTitle>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
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
                      placeholder="Describe the product and its specifications"
                      className="min-h-[100px]"
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
                className="flex-1"
              >
                {isLoading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Product')}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
