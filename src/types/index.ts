
export type UserRole = 'super_admin' | 'factory_admin' | 'supervisor' | 'employee';

export interface User {
  id: string;
  autoId?: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  tenantId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Tenant {
  id: string;
  factoryName: string;
  address: string;
  workersCount: number;
  ownerEmail: string;
  phone: string;
  status: 'pending' | 'active' | 'rejected' | 'frozen';
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  stages: ProcessStage[];
}

export interface ProcessStage {
  id: string;
  productId: string;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
}

export interface Task {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  productId: string;
  productName: string;
  processStageId: string;
  processStageeName: string;
  targetQty: number;
  completedQty: number;
  progress: number;
  status: 'active' | 'completed' | 'confirmed' | 'rejected' | 'overdue';
  deadlineWeek: string;
  deadline: string;
  notes?: string;
  rejectionReason?: string;
  assignedBy: string;
  assignedAt: string;
  completedAt?: string;
  confirmedAt?: string;
}

export interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SignupForm {
  // Step 1: Factory Details
  factoryName: string;
  address: string;
  workersCount: number;
  
  // Step 2: Owner Contact
  ownerEmail: string;
  phone: string;
  
  // Step 3: Security
  loginEmail: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}
