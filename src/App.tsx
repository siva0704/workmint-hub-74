// Factory Management System
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { TenantHeader } from "@/components/layout/TenantHeader";
import { RoleNav } from "@/components/layout/RoleNav";
import { useEffect } from "react";

// Pages
import { Landing } from "./pages/Landing";
import { Signup } from "./pages/Signup";
import { PendingApproval } from "./pages/PendingApproval";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Role-specific pages
import { SuperAdminDashboard } from "./pages/SuperAdmin/Dashboard";
import { SuperAdminTenants } from "./pages/SuperAdmin/Tenants";
import { SuperAdminSettings } from "./pages/SuperAdmin/Settings";
import { FactoryAdminDashboard } from "./pages/FactoryAdmin/Dashboard";
import { ProductsPage } from "./pages/FactoryAdmin/Products";
import { ProductDetailPage } from "./pages/FactoryAdmin/ProductDetail";
import { UsersPage } from "./pages/FactoryAdmin/Users";
import { UserDetailPage } from "./pages/FactoryAdmin/UserDetail";
import { FactorySettingsPage } from "./pages/FactoryAdmin/Settings";
import { SupervisorDashboard } from "./pages/Supervisor/Dashboard";
import { TaskAssignPage } from "./pages/Supervisor/TaskAssign";
import { TaskReviewPage } from "./pages/Supervisor/TaskReview";
import { EmployeeDashboard } from "./pages/Employee/Dashboard";
import { EmployeeTasksPage } from "./pages/Employee/Tasks";
import { EmployeeProfilePage } from "./pages/Employee/Profile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => {
  const { isAuthenticated, user } = useAuthStore();

  // Initialize auth state from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    const authStorage = localStorage.getItem('auth-storage');
    
    if (token && authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        if (state?.user && state?.isAuthenticated) {
          // Auth state is already restored by Zustand persist
          console.log('Auth state restored from localStorage');
        }
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        localStorage.removeItem('auth-token');
        localStorage.removeItem('refresh-token');
        localStorage.removeItem('auth-storage');
      }
    }
  }, []);

  // Role-based dashboard routing
  const getDashboardComponent = () => {
    if (!user) return <Dashboard />;
    
    switch (user.role) {
      case 'super_admin':
        return <SuperAdminDashboard />;
      case 'factory_admin':
        return <FactoryAdminDashboard />;
      case 'supervisor':
        return <SupervisorDashboard />;
      case 'employee':
        return <EmployeeDashboard />;
      default:
        return <Dashboard />;
    }
  };

  // Protected Route Component
  const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Global header and bottom nav when authenticated, with singleton guards inside components */}
          {isAuthenticated && <TenantHeader />}
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                {getDashboardComponent()}
              </ProtectedRoute>
            } />
            
            {/* Super Admin Routes */}
            <Route path="/tenants" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdminTenants />
              </ProtectedRoute>
            } />
            <Route path="/super-admin/settings" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdminSettings />
              </ProtectedRoute>
            } />
            
            {/* Factory Admin Routes */}
            <Route path="/products" element={
              <ProtectedRoute allowedRoles={['factory_admin']}>
                <ProductsPage />
              </ProtectedRoute>
            } />
            <Route path="/products/:productId" element={
              <ProtectedRoute allowedRoles={['factory_admin']}>
                <ProductDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute allowedRoles={['factory_admin']}>
                <UsersPage />
              </ProtectedRoute>
            } />
            <Route path="/users/:userId" element={
              <ProtectedRoute allowedRoles={['factory_admin']}>
                <UserDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['factory_admin']}>
                <FactorySettingsPage />
              </ProtectedRoute>
            } />
            
            {/* Supervisor Routes */}
            <Route path="/assign" element={
              <ProtectedRoute allowedRoles={['supervisor', 'factory_admin']}>
                <TaskAssignPage />
              </ProtectedRoute>
            } />
            <Route path="/review" element={
              <ProtectedRoute allowedRoles={['supervisor', 'factory_admin']}>
                <TaskReviewPage />
              </ProtectedRoute>
            } />
            
            {/* Employee Routes */}
            <Route path="/tasks" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeTasksPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeProfilePage />
              </ProtectedRoute>
            } />
            
            {/* Redirect unmatched protected routes to dashboard */}
            <Route path="*" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
            } />
            
            {/* Fallback route */}
          </Routes>
          {isAuthenticated && <RoleNav />}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
