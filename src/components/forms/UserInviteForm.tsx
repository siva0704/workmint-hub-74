
import { useState } from 'react';
import { useCreateUser } from '@/hooks/useApi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types';
import { useAuthStore } from '@/stores/auth';

const userInviteSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().min(10, 'Valid mobile number is required'),
  email: z.string().email('Valid email is required').optional(),
  role: z.enum(['factory_admin', 'supervisor', 'employee'] as const),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UserInviteFormData = z.infer<typeof userInviteSchema>;

interface UserInviteFormProps {
  children: React.ReactNode;
  user?: any; // For editing existing user
  onSubmit?: (data: UserInviteFormData) => void;
}

export const UserInviteForm = ({ children, user: existingUser, onSubmit }: UserInviteFormProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuthStore();
  const createUserMutation = useCreateUser();
  
  const isEdit = Boolean(existingUser);
  const isLoading = createUserMutation.isPending;

  const form = useForm<UserInviteFormData>({
    resolver: zodResolver(userInviteSchema),
    defaultValues: {
      name: existingUser?.name || '',
      mobile: existingUser?.mobile || '',
      email: existingUser?.email || '',
      role: 'employee',
      password: '',
      confirmPassword: '',
    },
  });

  // Role-based access control for user creation
  const canCreateRole = (role: UserRole): boolean => {
    if (currentUser?.role === 'factory_admin') return true;
    if (currentUser?.role === 'supervisor') {
      return role === 'employee'; // Supervisors can only create employees
    }
    return false;
  };

  const handleSubmit = async (data: UserInviteFormData) => {
    try {
      if (!canCreateRole(data.role)) {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to create this role.',
          variant: 'destructive',
        });
        return;
      }

      await createUserMutation.mutateAsync({
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        role: data.role,
        password: data.password,
      });
      
      onSubmit?.(data);
      
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('User invite error:', error);
    }
  };

  const availableRoles = () => {
    if (currentUser?.role === 'factory_admin') {
      return [
        { value: 'supervisor', label: 'Supervisor' },
        { value: 'employee', label: 'Employee' },
      ];
    }
    if (currentUser?.role === 'supervisor') {
      return [{ value: 'employee', label: 'Employee' }];
    }
    return [];
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh]">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit User' : 'Invite Team Member'}</SheetTitle>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-6">
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
                    <Input placeholder="+1234567890" {...field} />
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
                    <Input type="email" placeholder="email@example.com" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRoles().map((role) => (
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

            {!isEdit && (
              <>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

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
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update User' : 'Create User')}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
