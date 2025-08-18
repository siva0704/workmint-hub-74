import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Edit, Phone, Mail, UserIcon, Calendar, Shield } from 'lucide-react';
import { TenantHeader } from '@/components/layout/TenantHeader';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { UserInviteForm } from '@/components/forms/UserInviteForm';
import { User, UserRole } from '@/types';

// Mock data - in real app this would come from API
const mockUser: User = {
  id: '1',
  autoId: 'EMP001',
  name: 'John Smith',
  email: 'john.smith@factory.com',
  mobile: '+1234567890',
  role: 'employee',
  tenantId: 'tenant1',
  isActive: true,
  createdAt: '2024-01-15T09:00:00Z'
};

export const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(mockUser);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'factory_admin': return <Shield className="w-4 h-4" />;
      case 'supervisor': return <UserIcon className="w-4 h-4" />;
      case 'employee': return <UserIcon className="w-4 h-4" />;
      default: return <UserIcon className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'factory_admin': return 'destructive';
      case 'supervisor': return 'default';
      case 'employee': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatRole = (role: UserRole) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <MobileLayout>
      <TenantHeader />
      
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/users')}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Users
          </Button>
        </div>

        {/* User Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="text-lg">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getRoleColor(user.role) as any} className="flex items-center gap-1">
                    {getRoleIcon(user.role)}
                    {formatRole(user.role)}
                  </Badge>
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {user.autoId && (
                  <p className="text-sm text-muted-foreground mt-1">ID: {user.autoId}</p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UserInviteForm>
              <Button variant="outline" className="w-full">
                <Edit className="w-4 h-4 mr-2" />
                Edit User Details
              </Button>
            </UserInviteForm>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mobile</p>
                <p className="font-medium">{user.mobile}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">{formatDate(user.createdAt)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Access Level</p>
                <p className="font-medium">{formatRole(user.role)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};