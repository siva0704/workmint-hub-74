
import { ReactNode } from 'react';
import { TenantHeader } from './TenantHeader';
import { RoleNav } from './RoleNav';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
}

export const MobileLayout = ({ 
  children, 
  showHeader = true, 
  showNav = true 
}: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && <TenantHeader />}
      
      <main className={cn(
        "pb-4 px-4 sm:px-6", // add responsive horizontal padding for mobile
        showNav && "pb-20", // Add bottom padding for nav
        showHeader && "pt-0"  // Header is sticky, no extra padding needed
      )}>
        {children}
      </main>
      
      {showNav && <RoleNav />}
    </div>
  );
};
