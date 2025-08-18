
import React, { useEffect, useState } from 'react';
import { Building2, Menu, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TenantHeaderProps {
  onMenuClick?: () => void;
  showMenu?: boolean;
}

// Ensure only one header renders at a time (prevents duplicates if pages also include TenantHeader)
let tenantHeaderMounted = false;

export const TenantHeader = ({ onMenuClick, showMenu = false }: TenantHeaderProps) => {
  const { tenant, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!tenantHeaderMounted) {
      tenantHeaderMounted = true;
      setShouldRender(true);
    } else {
      setShouldRender(false);
    }
    return () => {
      tenantHeaderMounted = false;
    };
  }, []);

  if (!shouldRender) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const avatarInitial =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    'U';

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {showMenu && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="tap-target"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-factory-gradient rounded-lg flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-factory-dark">
              {tenant?.factoryName || 'WorkMint Hub'}
            </h1>
            <p className="text-xs text-factory-medium">
              {user?.role?.replace('_', ' ')?.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-8 h-8 bg-mint-fresh rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {avatarInitial}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 bg-white">
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
