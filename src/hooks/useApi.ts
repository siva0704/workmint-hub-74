// React Query hooks for API integration
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, handleApiError } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

// Query Keys
export const QUERY_KEYS = {
  USERS: 'users',
  PRODUCTS: 'products',
  TASKS: 'tasks',
  TENANTS: 'tenants',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
} as const;

// Authentication Hooks
export const useLogin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.login(email, password),
    onSuccess: (data) => {
      // Store tokens
      localStorage.setItem('auth-token', data.data.token);
      localStorage.setItem('refresh-token', data.data.refreshToken);
      // Invalidate and refetch user data
      queryClient.invalidateQueries();
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
    },
    onError: (error) => handleApiError(error, toast),
  });
};

export const useLogout = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('refresh-token');
      queryClient.clear();
      toast({
        title: 'Logged Out',
        description: 'See you next time!',
      });
    },
    onError: (error) => handleApiError(error, toast),
  });
};

// User Management Hooks
export const useUsers = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS, page, limit],
    queryFn: () => api.getUsers(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateUser = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: any) => api.createUser(userData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      toast({
        title: 'User Created',
        description: `User ${data.data.user.name} (${data.data.autoId}) has been created successfully.`,
      });
    },
    onError: (error) => handleApiError(error, toast),
  });
};

export const useUpdateUser = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, userData }: { userId: string; userData: any }) =>
      api.updateUser(userId, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      toast({
        title: 'User Updated',
        description: 'User information has been updated successfully.',
      });
    },
    onError: (error) => handleApiError(error, toast),
  });
};

export const useBulkImportUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (users: any[]) => api.bulkImportUsers(users),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      toast({
        title: 'Bulk Import Complete',
        description: `${data.data.success} users imported successfully.`,
      });
    },
    onError: (error) => handleApiError(error, toast),
  });
};

// Product Management Hooks
export const useProducts = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, page, limit],
    queryFn: () => api.getProducts(page, limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateProduct = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: any) => api.createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
      toast({
        title: 'Product Created',
        description: 'Product has been created successfully.',
      });
    },
    onError: (error) => handleApiError(error, toast),
  });
};

export const useUpdateProduct = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, productData }: { productId: string; productData: any }) =>
      api.updateProduct(productId, productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
      toast({
        title: 'Product Updated',
        description: 'Product has been updated successfully.',
      });
    },
    onError: (error) => handleApiError(error, toast),
  });
};

// Task Management Hooks
export const useTasks = (filters?: any) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TASKS, filters],
    queryFn: () => api.getTasks(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes for more frequent updates
  });
};

export const useCreateTask = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskData: any) => api.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
      toast({
        title: 'Task Assigned',
        description: 'Task has been assigned successfully.',
      });
    },
    onError: (error) => handleApiError(error, toast),
  });
};

export const useUpdateTaskProgress = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, completedQty }: { taskId: string; completedQty: number }) =>
      api.updateTaskProgress(taskId, completedQty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
      toast({
        title: 'Progress Updated',
        description: 'Task progress has been saved.',
      });
    },
    onError: (error) => handleApiError(error, toast),
  });
};

export const useConfirmTask = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, confirmedQty }: { taskId: string; confirmedQty?: number }) =>
      api.confirmTask(taskId, confirmedQty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
      toast({
        title: 'Task Confirmed',
        description: 'Task has been confirmed successfully.',
      });
    },
    onError: (error) => handleApiError(error, toast),
  });
};

export const useRejectTask = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, reason }: { taskId: string; reason: string }) =>
      api.rejectTask(taskId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
      toast({
        title: 'Task Rejected',
        description: 'Task has been rejected and sent back for revision.',
      });
    },
    onError: (error) => handleApiError(error, toast),
  });
};

// Tenant Management Hooks (Super Admin)
export const useTenants = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TENANTS, page, limit],
    queryFn: () => api.getTenants(page, limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const useApproveTenant = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, reason }: { tenantId: string; reason?: string }) =>
      api.approveTenant(tenantId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TENANTS] });
      toast({
        title: 'Tenant Approved',
        description: 'Factory has been approved and activated.',
      });
    },
    onError: (error) => handleApiError(error, toast),
  });
};

export const useRejectTenant = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, reason }: { tenantId: string; reason: string }) =>
      api.rejectTenant(tenantId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TENANTS] });
      toast({
        title: 'Tenant Rejected',
        description: 'Factory application has been rejected.',
      });
    },
    onError: (error) => handleApiError(error, toast),
  });
};

// File Upload Hook
export const useFileUpload = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ file, type }: { file: File; type: string }) =>
      api.uploadFile(file, type),
    onSuccess: () => {
      toast({
        title: 'File Uploaded',
        description: 'File has been uploaded successfully.',
      });
    },
    onError: (error) => handleApiError(error, toast),
  });
};

// Offline Support Hook
export const useOfflineSync = () => {
  const queryClient = useQueryClient();

  const syncOfflineData = async () => {
    const offlineData = localStorage.getItem('offline-data');
    if (offlineData) {
      try {
        const data = JSON.parse(offlineData);
        // Process offline data synchronization
        await Promise.all(
          data.map((item: any) => {
            // Sync based on item type
            switch (item.type) {
              case 'task-update':
                return api.updateTaskProgress(item.taskId, item.completedQty);
              default:
                return Promise.resolve();
            }
          })
        );
        
        localStorage.removeItem('offline-data');
        queryClient.invalidateQueries();
      } catch (error) {
        console.error('Offline sync failed:', error);
      }
    }
  };

  return { syncOfflineData };
};