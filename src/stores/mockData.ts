import { User, Tenant } from '@/types';

// Mock users for testing different roles
export const mockUsers: Record<string, { user: User; tenant?: Tenant }> = {
  // Super Admin (no tenant)
  'superadmin@factory.com': {
    user: {
      id: 'sa1',
      name: 'Super Admin',
      email: 'superadmin@factory.com',
      mobile: '+1234567890',
      role: 'super_admin',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    }
  },
  
  // Factory Admin
  'admin@demo-factory.com': {
    user: {
      id: 'fa1',
      name: 'Factory Admin',
      email: 'admin@demo-factory.com',
      mobile: '+1234567891',
      role: 'factory_admin',
      tenantId: 'tenant1',
      isActive: true,
      createdAt: '2024-01-01T10:00:00Z'
    },
    tenant: {
      id: 'tenant1',
      factoryName: 'Demo Factory',
      address: '123 Industrial Ave, Factory City, FC 12345',
      workersCount: 150,
      ownerEmail: 'owner@demo-factory.com',
      phone: '+1234567891',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      approvedAt: '2024-01-02T00:00:00Z'
    }
  },
  
  // Supervisor
  'supervisor@demo-factory.com': {
    user: {
      id: 'sv1',
      autoId: 'SUP001',
      name: 'John Supervisor',
      email: 'supervisor@demo-factory.com',
      mobile: '+1234567892',
      role: 'supervisor',
      tenantId: 'tenant1',
      isActive: true,
      createdAt: '2024-01-01T10:00:00Z'
    },
    tenant: {
      id: 'tenant1',
      factoryName: 'Demo Factory',
      address: '123 Industrial Ave, Factory City, FC 12345',
      workersCount: 150,
      ownerEmail: 'owner@demo-factory.com',
      phone: '+1234567891',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      approvedAt: '2024-01-02T00:00:00Z'
    }
  },
  
  // Employee
  'employee@demo-factory.com': {
    user: {
      id: 'emp1',
      autoId: 'EMP001',
      name: 'Jane Employee',
      email: 'employee@demo-factory.com',
      mobile: '+1234567893',
      role: 'employee',
      tenantId: 'tenant1',
      isActive: true,
      createdAt: '2024-01-01T10:00:00Z'
    },
    tenant: {
      id: 'tenant1',
      factoryName: 'Demo Factory',
      address: '123 Industrial Ave, Factory City, FC 12345',
      workersCount: 150,
      ownerEmail: 'owner@demo-factory.com',
      phone: '+1234567891',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      approvedAt: '2024-01-02T00:00:00Z'
    }
  }
};

// Mock tenants data
export const mockTenants: Tenant[] = [
  {
    id: 'tenant1',
    factoryName: 'Demo Factory',
    address: '123 Industrial Ave, Factory City, FC 12345',
    workersCount: 150,
    ownerEmail: 'owner@demo-factory.com',
    phone: '+1234567891',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    approvedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: 'tenant2',
    factoryName: 'Pending Factory',
    address: '456 Manufacturing St, Factory City, FC 12346',
    workersCount: 75,
    ownerEmail: 'owner@pending-factory.com',
    phone: '+1234567892',
    status: 'pending',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'tenant3',
    factoryName: 'Rejected Factory',
    address: '789 Industry Blvd, Factory City, FC 12347',
    workersCount: 100,
    ownerEmail: 'owner@rejected-factory.com',
    phone: '+1234567893',
    status: 'rejected',
    createdAt: '2024-01-10T00:00:00Z',
    rejectedAt: '2024-01-12T00:00:00Z',
    rejectionReason: 'Insufficient documentation provided'
  },
  {
    id: 'tenant4',
    factoryName: 'Frozen Factory',
    address: '321 Production Ave, Factory City, FC 12348',
    workersCount: 200,
    ownerEmail: 'owner@frozen-factory.com',
    phone: '+1234567894',
    status: 'frozen',
    createdAt: '2024-01-05T00:00:00Z',
    approvedAt: '2024-01-06T00:00:00Z'
  }
];

// Mock API functions
export const mockAPI = {
  getTenants: (): Promise<Tenant[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockTenants);
      }, 500);
    });
  },

  approveTenant: (tenantId: string): Promise<Tenant> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const tenantIndex = mockTenants.findIndex(t => t.id === tenantId);
        if (tenantIndex !== -1) {
          mockTenants[tenantIndex] = {
            ...mockTenants[tenantIndex],
            status: 'active',
            approvedAt: new Date().toISOString()
          };
          resolve(mockTenants[tenantIndex]);
        } else {
          reject(new Error('Tenant not found'));
        }
      }, 1000);
    });
  },

  rejectTenant: (tenantId: string, reason: string): Promise<Tenant> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const tenantIndex = mockTenants.findIndex(t => t.id === tenantId);
        if (tenantIndex !== -1) {
          mockTenants[tenantIndex] = {
            ...mockTenants[tenantIndex],
            status: 'rejected',
            rejectedAt: new Date().toISOString(),
            rejectionReason: reason
          };
          resolve(mockTenants[tenantIndex]);
        } else {
          reject(new Error('Tenant not found'));
        }
      }, 1000);
    });
  }
};

// Mock login function
export const mockLogin = (email: string, password: string) => {
  return new Promise<{ user: User; tenant?: Tenant }>((resolve, reject) => {
    setTimeout(() => {
      const userData = mockUsers[email.toLowerCase()];
      
      if (userData && password === 'password123') {
        console.log(`Logging in as ${userData.user.role}:`, userData.user);
        resolve(userData);
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 1000);
  });
};
