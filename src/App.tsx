// Factory Management System
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { TenantHeader } from "@/components/layout/TenantHeader";
import { RoleNav } from "@/components/layout/RoleNav";

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

const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated, user } = useAuthStore();

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
            {isAuthenticated ? (
              <>
                <Route path="/dashboard" element={getDashboardComponent()} />
                
                {/* Super Admin Routes */}
                {user?.role === 'super_admin' && (
                  <>
                    <Route path="/tenants" element={<SuperAdminTenants />} />
                    <Route path="/super-admin/settings" element={<SuperAdminSettings />} />
                  </>
                )}
                
                {/* Factory Admin Routes */}
                {user?.role === 'factory_admin' && (
                  <>
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:productId" element={<ProductDetailPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/users/:userId" element={<UserDetailPage />} />
                    <Route path="/settings" element={<FactorySettingsPage />} />
                  </>
                )}
                
                {/* Supervisor Routes */}
                {user?.role === 'supervisor' && (
                  <>
                    <Route path="/assign" element={<TaskAssignPage />} />
                    <Route path="/review" element={<TaskReviewPage />} />
                  </>
                )}
                
                {/* Employee Routes */}
                {user?.role === 'employee' && (
                  <>
                    <Route path="/tasks" element={<EmployeeTasksPage />} />
                    <Route path="/profile" element={<EmployeeProfilePage />} />
                  </>
                )}
                
                {/* Redirect unmatched routes to dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </>
            ) : (
              <>
                {/* Redirect protected routes to login */}
                <Route path="/dashboard" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            )}
            
            {/* Fallback route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          {isAuthenticated && <RoleNav />}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
