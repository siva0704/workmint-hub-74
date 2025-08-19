import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Settings, Shield, Database, Bell, Users, Activity, User, Eye, EyeOff, Save } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { useUpdateUser, useUpdateSuperAdminProfile, useChangePassword, useSystemStats } from '@/hooks/useApi';

interface SuperAdminProfile {
  name: string;
  email: string;
  mobile: string;
  autoId: string;
}

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UserObject {
  _id?: string;
  id?: string;
}

interface GlobalSettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    passwordExpiry: number;
  };
  dataRetention: {
    taskHistoryDays: number;
    auditLogDays: number;
    inactiveUserDays: number;
  };
  systemSettings: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    backupFrequency: string;
  };
}

const initialSettings: GlobalSettings = {
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    passwordExpiry: 90,
  },
  dataRetention: {
    taskHistoryDays: 365,
    auditLogDays: 730,
    inactiveUserDays: 180,
  },
  systemSettings: {
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    backupFrequency: 'daily',
  },
};

import { formatAuditTimestamp } from '@/utils/timeUtils';

const mockAuditLogs = [
  { id: 1, action: 'Tenant Approved', user: 'super_admin', timestamp: formatAuditTimestamp(new Date(Date.now() - 2 * 60 * 60 * 1000)), details: 'Steel Manufacturing Co.' },
  { id: 2, action: 'Settings Updated', user: 'super_admin', timestamp: formatAuditTimestamp(new Date(Date.now() - 4 * 60 * 60 * 1000)), details: 'Password policy modified' },
  { id: 3, action: 'Tenant Rejected', user: 'super_admin', timestamp: formatAuditTimestamp(new Date(Date.now() - 24 * 60 * 60 * 1000)), details: 'Failed security review' },
];

export const SuperAdminSettings = () => {
  const [settings, setSettings] = useState({
    // Password Policy
    minPasswordLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    passwordExpiry: 90,
    
    // Data Retention
    taskHistoryRetention: 365,
    auditLogRetention: 730,
    userDataRetention: 1095,
    
    // System Settings
    maintenanceMode: false,
    allowNewRegistrations: true,
    requireEmailVerification: true,
    enableTwoFactor: false,
    
    // Notifications
    systemAlerts: true,
    securityAlerts: true,
    performanceAlerts: true,
    weeklyReports: true
  });

  // SuperAdmin Profile State
  const [adminProfile, setAdminProfile] = useState<SuperAdminProfile>({
    name: '',
    email: '',
    mobile: '',
    autoId: '',
  });
  const [passwordData, setPasswordData] = useState<PasswordChange>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const { toast } = useToast();
  const { user } = useAuthStore();
  const updateUser = useAuthStore((s) => s.updateUser);
  const updateUserMutation = useUpdateUser();
  const updateSuperAdminProfileMutation = useUpdateSuperAdminProfile();
  const changePasswordMutation = useChangePassword();

  // Initialize admin profile from user data
  useEffect(() => {
    if (user) {
      setAdminProfile({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        autoId: user.autoId || '',
      });
    }
  }, [user]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // Mock save functionality
    toast({
      title: 'Settings Updated',
      description: 'Global settings have been saved successfully.',
    });
  };

  const handleSaveProfile = async () => {
    const userId = user?.id || (user as UserObject)?._id;
    
    console.log('SuperAdmin - handleSaveProfile - user object:', user);
    console.log('SuperAdmin - handleSaveProfile - extracted userId:', userId);
    console.log('SuperAdmin - handleSaveProfile - adminProfile:', adminProfile);
    
    if (!userId) {
      toast({
        title: 'Error',
        description: 'Unable to save profile - user ID not found',
        variant: 'destructive'
      });
      return;
    }

    // Validate required fields
    if (!adminProfile.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name is required',
        variant: 'destructive'
      });
      return;
    }

    if (!adminProfile.mobile.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Mobile number is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('SuperAdmin - updating profile via SuperAdmin endpoint');
      const result = await updateSuperAdminProfileMutation.mutateAsync({
        userId: userId,
        userData: {
          name: adminProfile.name,
          email: adminProfile.email,
          mobile: adminProfile.mobile,
        },
      });

      // Update local auth store
      if (result?.data) {
        updateUser(result.data);
        toast({
          title: 'Profile Updated',
          description: result.message || 'Your profile has been updated successfully.',
        });
      }
    } catch (error) {
      console.error('Save profile error:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleChangePassword = async () => {
    const userId = user?.id || (user as UserObject)?._id;
    
    if (!userId) {
      toast({
        title: 'Error',
        description: 'Unable to change password - user ID not found',
        variant: 'destructive'
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'New password and confirm password do not match.',
        variant: 'destructive'
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Invalid Password',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        userId: userId,
        passwordData: {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
      });

      // Reset password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      toast({
        title: 'Password Changed',
        description: result?.message || 'Your password has been changed successfully.',
      });
    } catch (error) {
      console.error('Change password error:', error);
      toast({
        title: 'Password Change Failed',
        description: 'Failed to change password. Please check your current password.',
        variant: 'destructive'
      });
    }
  };

  const updateAdminProfile = (field: keyof SuperAdminProfile, value: string) => {
    setAdminProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updatePasswordData = (field: keyof PasswordChange, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Get real system stats
  const { data: systemStats, isLoading: statsLoading } = useSystemStats();

  return (
    <div className="p-4 space-y-6">
        <div>
          <h1 className="text-hero">Global Settings</h1>
          <p className="text-muted-foreground mt-1">Configure system-wide policies and preferences</p>
        </div>

        {/* System Health Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading...</p>
                </div>
                <div className="text-center">
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading...</p>
                </div>
                <div className="text-center">
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading...</p>
                </div>
                <div className="text-center">
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading...</p>
                </div>
              </div>
            ) : systemStats?.data ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{systemStats.data.totalTenants}</p>
                  <p className="text-sm text-muted-foreground">Total Tenants</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{systemStats.data.totalUsers}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{systemStats.data.systemUptime}</p>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">{systemStats.data.storageUsed}</p>
                  <p className="text-sm text-muted-foreground">Storage Used</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{systemStats.data.activeConnections}</p>
                  <p className="text-sm text-muted-foreground">Active Connections</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{systemStats.data.pendingTenants}</p>
                  <p className="text-sm text-muted-foreground">Pending Tenants</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{systemStats.data.totalTasks}</p>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-600">{systemStats.data.systemLoad}%</p>
                  <p className="text-sm text-muted-foreground">System Load</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Failed to load system stats</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-1">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-1">
              <Database className="w-4 h-4" />
              Data
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1">
              <Bell className="w-4 h-4" />
              Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <User className="h-5 w-5" />
                  Super Admin Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="text-lg bg-purple-100 text-purple-700">
                      {adminProfile.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-slate-900">{adminProfile.name || 'Super Admin'}</h3>
                    <p className="text-sm text-slate-500">System Administrator</p>
                    <p className="text-xs text-slate-400">ID: {adminProfile.autoId}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-name" className="text-slate-700">Full Name</Label>
                    <Input
                      id="admin-name"
                      value={adminProfile.name}
                      onChange={(e) => updateAdminProfile('name', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="text-slate-700">Email Address</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={adminProfile.email}
                      onChange={(e) => updateAdminProfile('email', e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-mobile" className="text-slate-700">Mobile Number</Label>
                    <Input
                      id="admin-mobile"
                      value={adminProfile.mobile}
                      onChange={(e) => updateAdminProfile('mobile', e.target.value)}
                      placeholder="Enter your mobile number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-id" className="text-slate-700">Admin ID</Label>
                    <Input
                      id="admin-id"
                      value={adminProfile.autoId}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSaveProfile}
                  disabled={updateUserMutation.isPending || updateSuperAdminProfileMutation.isPending}
                  className="w-full md:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateUserMutation.isPending || updateSuperAdminProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-slate-700">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => updatePasswordData('currentPassword', e.target.value)}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                    >
                      {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-slate-700">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => updatePasswordData('newPassword', e.target.value)}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                    >
                      {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-slate-700">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPassword.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => updatePasswordData('confirmPassword', e.target.value)}
                      placeholder="Confirm new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                    >
                      {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  variant="outline"
                  className="w-full md:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Password Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="minPasswordLength">Minimum Password Length</Label>
                  <Input
                    id="minPasswordLength"
                    type="number"
                    value={settings.minPasswordLength}
                    onChange={(e) => handleSettingChange('minPasswordLength', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
                    <Switch
                      id="requireUppercase"
                      checked={settings.requireUppercase}
                      onCheckedChange={(checked) => handleSettingChange('requireUppercase', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireNumbers">Require Numbers</Label>
                    <Switch
                      id="requireNumbers"
                      checked={settings.requireNumbers}
                      onCheckedChange={(checked) => handleSettingChange('requireNumbers', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                    <Switch
                      id="requireSpecialChars"
                      checked={settings.requireSpecialChars}
                      onCheckedChange={(checked) => handleSettingChange('requireSpecialChars', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableTwoFactor">Enable Two-Factor Authentication</Label>
                    <Switch
                      id="enableTwoFactor"
                      checked={settings.enableTwoFactor}
                      onCheckedChange={(checked) => handleSettingChange('enableTwoFactor', checked)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={settings.passwordExpiry}
                    onChange={(e) => handleSettingChange('passwordExpiry', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="allowNewRegistrations">Allow New Registrations</Label>
                  <Switch
                    id="allowNewRegistrations"
                    checked={settings.allowNewRegistrations}
                    onCheckedChange={(checked) => handleSettingChange('allowNewRegistrations', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                  <Switch
                    id="requireEmailVerification"
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) => handleSettingChange('requireEmailVerification', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                    />
                    {settings.maintenanceMode && (
                      <Badge variant="destructive">Active</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Retention Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="taskHistoryRetention">Task History Retention (days)</Label>
                  <Input
                    id="taskHistoryRetention"
                    type="number"
                    value={settings.taskHistoryRetention}
                    onChange={(e) => handleSettingChange('taskHistoryRetention', parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Completed tasks older than this will be archived
                  </p>
                </div>

                <div>
                  <Label htmlFor="auditLogRetention">Audit Log Retention (days)</Label>
                  <Input
                    id="auditLogRetention"
                    type="number"
                    value={settings.auditLogRetention}
                    onChange={(e) => handleSettingChange('auditLogRetention', parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    System audit logs for compliance and security
                  </p>
                </div>

                <div>
                  <Label htmlFor="userDataRetention">User Data Retention (days)</Label>
                  <Input
                    id="userDataRetention"
                    type="number"
                    value={settings.userDataRetention}
                    onChange={(e) => handleSettingChange('userDataRetention', parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Inactive user data retention period
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="systemAlerts">System Alerts</Label>
                  <Switch
                    id="systemAlerts"
                    checked={settings.systemAlerts}
                    onCheckedChange={(checked) => handleSettingChange('systemAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="securityAlerts">Security Alerts</Label>
                  <Switch
                    id="securityAlerts"
                    checked={settings.securityAlerts}
                    onCheckedChange={(checked) => handleSettingChange('securityAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="performanceAlerts">Performance Alerts</Label>
                  <Switch
                    id="performanceAlerts"
                    checked={settings.performanceAlerts}
                    onCheckedChange={(checked) => handleSettingChange('performanceAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="weeklyReports">Weekly Reports</Label>
                  <Switch
                    id="weeklyReports"
                    checked={settings.weeklyReports}
                    onCheckedChange={(checked) => handleSettingChange('weeklyReports', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Button onClick={handleSaveSettings} className="w-full">
          <Settings className="w-4 w-4 mr-2" />
          Save Global Settings
        </Button>
      </div>
  );
};
