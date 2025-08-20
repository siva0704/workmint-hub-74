import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Edit, Phone, Mail, UserIcon, Calendar, Shield, Loader2 } from 'lucide-react';
import { UserEditForm } from '@/components/forms/UserEditForm';
import { User, UserRole } from '@/types';
import { useUser } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';

export const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch real user data
  console.log('UserDetail - userId:', userId);
  
  // Don't fetch if userId is not available
  if (!userId) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-muted-foreground">Invalid user ID</p>
          <Button onClick={() => navigate('/users')} className="mt-4">
            Back to Users
          </Button>
        </div>
      </div>
    );
  }
  
  const { data: userResponse, isLoading, error } = useUser(userId);
  console.log('UserDetail - user data:', userResponse);
  console.log('UserDetail - isLoading:', isLoading);
  console.log('UserDetail - error:', error);
  
  // Extract the actual user data from the response
  const user = userResponse?.data;

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading user details...</span>
        </div>
      </div>
    );
  }

  if (error || !userResponse || !user) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load user details</p>
          <Button onClick={() => navigate('/users')} className="mt-4">
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

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
                  {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-xl">{user.name || 'Unknown User'}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getRoleColor(user.role || 'employee') as any} className="flex items-center gap-1">
                    {getRoleIcon(user.role || 'employee')}
                    {formatRole(user.role || 'employee')}
                  </Badge>
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {(user.autoId || user.id || user._id) && (
                  <p className="text-sm text-muted-foreground mt-1">ID: {user.autoId || user.id || user._id}</p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UserEditForm user={user} onSuccess={() => window.location.reload()}>
              <Button variant="outline" className="w-full">
                <Edit className="w-4 h-4 mr-2" />
                Edit User Details
              </Button>
            </UserEditForm>
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
                <p className="font-medium">{user.email || 'No email provided'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mobile</p>
                <p className="font-medium">{user.mobile || 'No mobile provided'}</p>
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
                <p className="font-medium">{user.createdAt ? formatDate(user.createdAt) : 'Unknown'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Access Level</p>
                <p className="font-medium">{formatRole(user.role || 'employee')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
};