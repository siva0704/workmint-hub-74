import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Search, Mail, Phone, Settings, Crown, Eye, Users } from 'lucide-react';
import { TenantHeader } from '@/components/layout/TenantHeader';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { UserInviteForm } from '@/components/forms/UserInviteForm';
import { User, UserRole } from '@/types';

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    autoId: 'EMP001',
    name: 'John Smith',
    email: 'john.smith@acme.com',
    mobile: '+1-555-0101',
    role: 'supervisor',
    tenantId: 'tenant1',
    isActive: true,
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '2',
    autoId: 'EMP002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@acme.com',
    mobile: '+1-555-0102',
    role: 'employee',
    tenantId: 'tenant1',
    isActive: true,
    createdAt: '2024-01-12T14:30:00Z'
  },
  {
    id: '3',
    autoId: 'EMP003',
    name: 'Mike Wilson',
    email: 'mike.wilson@acme.com',
    mobile: '+1-555-0103',
    role: 'employee',
    tenantId: 'tenant1',
    isActive: true,
    createdAt: '2024-01-15T09:15:00Z'
  },
  {
    id: '4',
    autoId: 'EMP004',
    name: 'Lisa Brown',
    email: '',
    mobile: '+1-555-0104',
    role: 'employee',
    tenantId: 'tenant1',
    isActive: false,
    createdAt: '2024-01-08T16:45:00Z'
  }
];

export const UsersPage = () => {
  const navigate = useNavigate();
  const [users] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.mobile.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'factory_admin': return <Crown className="w-4 h-4" />;
      case 'supervisor': return <Eye className="w-4 h-4" />;
      case 'employee': return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'factory_admin': return 'bg-purple-100 text-purple-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const UserCard = ({ user }: { user: User }) => (
    <Card className="mb-4">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{user.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {user.autoId}
              </Badge>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              {user.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                {user.mobile}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={getRoleColor(user.role)}>
              <span className="flex items-center gap-1">
                {getRoleIcon(user.role)}
                {user.role.replace('_', ' ')}
              </span>
            </Badge>
            <Badge variant={user.isActive ? "default" : "secondary"}>
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate(`/users/${user.id}`)}
          >
            <Eye className="w-4 h-4 mr-1" />
            View Profile
          </Button>
          <UserInviteForm>
            <Button size="sm" variant="outline" className="flex-1">
              <Mail className="w-4 h-4 mr-1" />
              Send Invite
            </Button>
          </UserInviteForm>
          <UserInviteForm>
            <Button size="sm" variant="outline">
              <Settings className="w-4 h-4" />
            </Button>
          </UserInviteForm>
        </div>

        <div className="text-xs text-muted-foreground">
          Joined: {new Date(user.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    supervisors: users.filter(u => u.role === 'supervisor').length,
    employees: users.filter(u => u.role === 'employee').length
  };

  return (
    <MobileLayout>
      <TenantHeader />
      
      <div className="p-4 space-y-6">
        <div>
          <h1 className="text-hero">Team Members</h1>
          <p className="text-muted-foreground mt-1">Manage your factory team and user roles</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Eye className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.supervisors}</p>
                  <p className="text-sm text-muted-foreground">Supervisors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.employees}</p>
                  <p className="text-sm text-muted-foreground">Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | 'all')}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="supervisor">Supervisors</SelectItem>
                <SelectItem value="employee">Employees</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive')}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Add User Button */}
        <UserInviteForm>
          <Button className="w-full h-auto p-4">
            <UserPlus className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Invite Team Member</p>
              <p className="text-sm opacity-90">Add supervisors or employees to your team</p>
            </div>
          </Button>
        </UserInviteForm>

        {/* Users List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-section">
              Team Members ({filteredUsers.length})
            </h2>
          </div>

          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <UserCard key={user.id} user={user} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-muted-foreground">
                  {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? (
                    <>
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No users found matching your filters</p>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No team members yet</p>
                      <p className="text-sm">Invite your first team member to get started</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};