import { useState, useEffect } from 'react';
import { useUpdateUser } from '@/hooks/useApi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { UserRole, User } from '@/types';

const userEditSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().min(10, 'Valid mobile number is required'),
  email: z.union([z.string().email('Valid email is required'), z.literal('')]).optional(),
  role: z.enum(['factory_admin', 'supervisor', 'employee'] as const),
});

type UserEditFormData = z.infer<typeof userEditSchema>;

interface UserEditFormProps {
  children: React.ReactNode;
  user: User;
  onSuccess?: () => void;
}

export const UserEditForm = ({ children, user, onSuccess }: UserEditFormProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const updateUserMutation = useUpdateUser();
  
  const isLoading = updateUserMutation.isPending;
  
  // Extract user ID properly - handle both string and object cases
  const userId = user?.id || (user as any)?._id;
  
  console.log('UserEditForm - user object:', user);
  console.log('UserEditForm - extracted userId:', userId);
  console.log('UserEditForm - userId type:', typeof userId);

  const form = useForm<UserEditFormData>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      name: user?.name || '',
      mobile: user?.mobile || '',
      email: user?.email || '',
      role: user?.role || 'employee',
    },
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        mobile: user.mobile || '',
        email: user.email || '',
        role: user.role || 'employee',
      });
    }
  }, [user, form]);

  // Log form state for debugging
  console.log('UserEditForm - form state:', form.formState);
  console.log('UserEditForm - form errors:', form.formState.errors);
  console.log('UserEditForm - form values:', form.getValues());

  const handleSubmit = async (data: UserEditFormData) => {
    console.log('UserEditForm - handleSubmit called with data:', data);
    console.log('UserEditForm - using userId:', userId);
    console.log('UserEditForm - user object:', user);
    console.log('UserEditForm - form state:', form.formState);
    console.log('UserEditForm - form errors:', form.formState.errors);
    
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User ID not found. Cannot update user.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      console.log('UserEditForm - making API call with:', {
        userId: userId,
        userData: {
          name: data.name,
          email: data.email,
          mobile: data.mobile,
          role: data.role,
        },
      });
      
      const result = await updateUserMutation.mutateAsync({
        userId: userId,
        userData: {
          name: data.name,
          email: data.email,
          mobile: data.mobile,
          role: data.role,
        },
      });
      
      console.log('UserEditForm - update successful:', result);
      toast({
        title: 'User Updated',
        description: 'User information has been updated successfully.',
      });
      
      onSuccess?.();
      setOpen(false);
    } catch (error) {
      console.error('UserEditForm - update error:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update user information. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const availableRoles = [
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'employee', label: 'Employee' },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Edit User Details</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter mobile number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  disabled={isLoading || !form.formState.isValid}
                  onClick={() => {
                    console.log('UserEditForm - Update button clicked!');
                    console.log('UserEditForm - Form errors:', form.formState.errors);
                    console.log('UserEditForm - Form valid:', form.formState.isValid);
                    console.log('UserEditForm - Current values:', form.getValues());
                  }}
                >
                  {isLoading ? 'Updating...' : 'Update User'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};
