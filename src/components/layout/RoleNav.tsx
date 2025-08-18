
import React, { useEffect, useState } from 'react';
import { Home, Package, Users, Settings, UserCheck, ClipboardList, User } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';

// Ensure only one bottom nav renders at a time
let roleNavMounted = false;

export const RoleNav = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!roleNavMounted) {
      roleNavMounted = true;
      setShouldRender(true);
    } else {
      setShouldRender(false);
    }
    return () => {
      roleNavMounted = false;
    };
  }, []);

  if (!user || !shouldRender) return null;

  const getNavItems = () => {
    switch (user.role) {
      case 'super_admin':
        return [
          { path: '/dashboard', icon: Home, label: 'Dashboard' },
          { path: '/tenants', icon: Users, label: 'Tenants' },
          { path: '/super-admin/settings', icon: Settings, label: 'Settings' },
        ];
      
      case 'factory_admin':
        return [
          { path: '/dashboard', icon: Home, label: 'Home' },
          { path: '/products', icon: Package, label: 'Products' },
          { path: '/users', icon: Users, label: 'People' },
          { path: '/settings', icon: Settings, label: 'Settings' },
        ];
      
      case 'supervisor':
        return [
          { path: '/dashboard', icon: Home, label: 'Home' },
          { path: '/assign', icon: ClipboardList, label: 'Assign' },
          { path: '/review', icon: UserCheck, label: 'Review' },
        ];
      
      case 'employee':
        return [
          { path: '/dashboard', icon: Home, label: 'Home' },
          { path: '/tasks', icon: ClipboardList, label: 'Tasks' },
          { path: '/profile', icon: User, label: 'Profile' },
        ];
      
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 pb-safe-bottom z-50">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive =
            location.pathname === path ||
            location.pathname.startsWith(`${path}/`);
          
          return (
            <NavLink
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors tap-target",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
