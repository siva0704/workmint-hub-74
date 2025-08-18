// API Service Layer for Backend Integration
// Ready for MongoDB + JWT authentication

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiService {
  private baseUrl: string;
  private timeout: number;

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('auth-token');

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        signal: AbortSignal.timeout(this.timeout),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Authentication Endpoints
  async login(email: string, password: string) {
    return this.request<{ user: any; tenant: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(signupData: any) {
    return this.request<{ tenantId: string }>('/tenants/signup', {
      method: 'POST',
      body: JSON.stringify(signupData),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async refreshToken() {
    return this.request<{ token: string }>('/auth/refresh', { method: 'POST' });
  }

  // Tenant Management (Super Admin)
  async getTenants(page: number = 1, limit: number = 10) {
    return this.request<PaginatedResponse<any>>(`/sa/tenants?page=${page}&limit=${limit}`);
  }

  async approveTenant(tenantId: string, reason?: string) {
    return this.request(`/sa/tenants/${tenantId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async rejectTenant(tenantId: string, reason: string) {
    return this.request(`/sa/tenants/${tenantId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async freezeTenant(tenantId: string) {
    return this.request(`/sa/tenants/${tenantId}/freeze`, { method: 'POST' });
  }

  // User Management
  async getUsers(page: number = 1, limit: number = 10) {
    return this.request<PaginatedResponse<any>>(`/users?page=${page}&limit=${limit}`);
  }

  async createUser(userData: any) {
    return this.request<{ user: any; autoId: string }>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, userData: any) {
    return this.request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/users/${userId}`, { method: 'DELETE' });
  }

  async inviteUser(inviteData: any) {
    return this.request('/users/invite', {
      method: 'POST',
      body: JSON.stringify(inviteData),
    });
  }

  async bulkImportUsers(users: any[]) {
    return this.request<{ success: number; errors: string[] }>('/users/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ users }),
    });
  }

  // Product Management
  async getProducts(page: number = 1, limit: number = 10) {
    return this.request<PaginatedResponse<any>>(`/products?page=${page}&limit=${limit}`);
  }

  async createProduct(productData: any) {
    return this.request<{ product: any }>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(productId: string, productData: any) {
    return this.request(`/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(productId: string) {
    return this.request(`/products/${productId}`, { method: 'DELETE' });
  }

  // Process Stage Management
  async getProductStages(productId: string) {
    return this.request<any[]>(`/products/${productId}/stages`);
  }

  async createProcessStage(productId: string, stageData: any) {
    return this.request(`/products/${productId}/stages`, {
      method: 'POST',
      body: JSON.stringify(stageData),
    });
  }

  async updateProcessStage(productId: string, stageId: string, stageData: any) {
    return this.request(`/products/${productId}/stages/${stageId}`, {
      method: 'PATCH',
      body: JSON.stringify(stageData),
    });
  }

  async reorderProcessStages(productId: string, stageOrders: { id: string; order: number }[]) {
    return this.request(`/products/${productId}/stages/reorder`, {
      method: 'POST',
      body: JSON.stringify({ stageOrders }),
    });
  }

  // Task Management
  async getTasks(filters?: any) {
    const params = new URLSearchParams(filters);
    return this.request<PaginatedResponse<any>>(`/tasks?${params}`);
  }

  async createTask(taskData: any) {
    return this.request<{ task: any }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTaskProgress(taskId: string, completedQty: number) {
    return this.request(`/tasks/${taskId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completedQty }),
    });
  }

  async confirmTask(taskId: string, confirmedQty?: number) {
    return this.request(`/tasks/${taskId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ confirmedQty }),
    });
  }

  async rejectTask(taskId: string, reason: string) {
    return this.request(`/tasks/${taskId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Notifications
  async getNotifications() {
    return this.request<any[]>('/notifications');
  }

  async markNotificationRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, { method: 'POST' });
  }

  // Reports & Analytics
  async getReports(type: string, filters?: any) {
    const params = new URLSearchParams(filters);
    return this.request<any>(`/reports/${type}?${params}`);
  }

  async exportReport(type: string, format: string, filters?: any) {
    const params = new URLSearchParams({ ...filters, format });
    return this.request<{ downloadUrl: string }>(`/reports/${type}/export?${params}`);
  }

  // File Upload
  async uploadFile(file: File, type: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request<{ fileUrl: string; fileId: string }>('/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove content-type to let browser set boundary
    });
  }
}

// API Instance with environment configuration
const apiConfig: ApiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000, // 30 seconds
};

export const api = new ApiService(apiConfig);

// Helper functions for common API patterns
export const withLoading = async <T>(
  apiCall: () => Promise<T>,
  setLoading: (loading: boolean) => void
): Promise<T> => {
  setLoading(true);
  try {
    return await apiCall();
  } finally {
    setLoading(false);
  }
};

export const handleApiError = (error: any, toast: any) => {
  console.error('API Error:', error);
  toast({
    title: 'Error',
    description: error.message || 'An unexpected error occurred',
    variant: 'destructive',
  });
};