// API Service Layer for Backend Integration
// Ready for MongoDB + JWT authentication
import { config } from '@/config/environment';

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
  private isRefreshing = false;
  private refreshPromise: Promise<any> | null = null;

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

    // Add tenant scoping for multi-tenant isolation
    const authStorage = localStorage.getItem('auth-storage');
    const user = authStorage ? JSON.parse(authStorage)?.state?.user : null;
    if (user?.tenantId) {
      defaultHeaders['X-Tenant-ID'] = user.tenantId;
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        signal: AbortSignal.timeout(this.timeout),
      });

      // Handle token expiry with automatic refresh
      if (response.status === 401 && !endpoint.includes('/auth/')) {
        const refreshed = await this.handleTokenRefresh();
        if (refreshed) {
          // Retry request with new token
          defaultHeaders.Authorization = `Bearer ${refreshed.token}`;
          response = await fetch(url, {
            ...options,
            headers: {
              ...defaultHeaders,
              ...options.headers,
            },
            signal: AbortSignal.timeout(this.timeout),
          });
        } else {
          // Redirect to login
          window.location.href = '/login';
          throw new Error('Authentication failed');
        }
      }

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'API request failed') as any;
        error.response = { data };
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  private async handleTokenRefresh(): Promise<{ token: string; refreshToken: string } | null> {
    if (this.isRefreshing) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.refreshTokenRequest();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async refreshTokenRequest(): Promise<{ token: string; refreshToken: string } | null> {
    try {
      const refreshToken = localStorage.getItem('refresh-token');
      if (!refreshToken) return null;

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      
      // Update stored tokens
      localStorage.setItem('auth-token', data.data.token);
      localStorage.setItem('refresh-token', data.data.refreshToken);
      
      return data.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  // Authentication Endpoints
  async login(loginData: { email?: string; autoId?: string; password: string }) {
    return this.request<{ user: any; tenant: any; token: string; refreshToken?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  async signup(signupData: any) {
    return this.request<{ tenantId: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(signupData),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Tenant Management (Super Admin)
  async getTenants(page: number = 1, limit: number = 10) {
    return this.request<any>(`/sa/tenants?page=${page}&limit=${limit}`);
  }

  async getTenant(tenantId: string) {
    console.log('API getTenant called with tenantId:', tenantId);
    console.log('API getTenant tenantId type:', typeof tenantId);
    return this.request<any>(`/tenants/${tenantId}`);
  }

  async updateTenant(tenantId: string, tenantData: any) {
    return this.request(`/tenants/${tenantId}`, {
      method: 'PATCH',
      body: JSON.stringify(tenantData),
    });
  }

  async approveTenant(tenantId: string, reason?: string) {
    if (!tenantId || typeof tenantId !== 'string') {
      throw new Error('Valid Tenant ID is required');
    }
    return this.request(`/sa/tenants/${tenantId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async rejectTenant(tenantId: string, reason: string) {
    if (!tenantId || typeof tenantId !== 'string') {
      throw new Error('Valid Tenant ID is required');
    }
    return this.request(`/sa/tenants/${tenantId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async freezeTenant(tenantId: string) {
    if (!tenantId || typeof tenantId !== 'string') {
      throw new Error('Valid Tenant ID is required');
    }
    return this.request(`/sa/tenants/${tenantId}/freeze`, { method: 'POST' });
  }

  // User Management
  async getUsers(page: number = 1, limit: number = 10) {
    return this.request<any>(`/users?page=${page}&limit=${limit}`);
  }

  async getUser(userId: string) {
    console.log('API getUser called with userId:', userId);
    return this.request<any>(`/users/${userId}`);
  }

  async createUser(userData: any) {
    return this.request<{ user: any; autoId: string }>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, userData: any) {
    console.log('API updateUser called with:', { userId, userData });
    return this.request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async updateSuperAdminProfile(userId: string, userData: any) {
    console.log('API updateSuperAdminProfile called with:', { userId, userData });
    return this.request(`/sa/users/${userId}/profile`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(userId: string, passwordData: { currentPassword: string; newPassword: string }) {
    return this.request(`/users/${userId}/change-password`, {
      method: 'POST',
      body: JSON.stringify(passwordData),
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
    return this.request<any>(`/products?page=${page}&limit=${limit}`);
  }

  async getProduct(productId: string) {
    return this.request<any>(`/products/${productId}`);
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
    return this.request<any>(`/tasks?${params}`);
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

  async deleteTask(taskId: string) {
    return this.request(`/tasks/${taskId}`, { method: 'DELETE' });
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

  // System Stats (Super Admin)
  async getSystemStats() {
    return this.request<{
      totalTenants: number;
      totalUsers: number;
      systemUptime: string;
      storageUsed: string;
      activeConnections: number;
      pendingTenants: number;
      activeTenants: number;
      totalTasks: number;
      completedTasks: number;
      systemLoad: number;
    }>('/sa/system-stats');
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
  baseUrl: config.apiBaseUrl,
  timeout: config.apiTimeout,
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