import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Palette, Calendar, Bell, Upload, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { useTenant, useUpdateTenant, useUpdateUser, useChangePassword } from '@/hooks/useApi';

interface AdminProfile {
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

interface TenantObject {
  _id?: string;
  id?: string;
}

interface UserObject {
  _id?: string;
  id?: string;
}

interface FactorySettings {
  branding: {
    factoryName: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
  };
  workSchedule: {
    workDays: string[];
    startTime: string;
    endTime: string;
    breakDuration: number;
    holidays: string[];
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    taskReminders: boolean;
    overdueAlerts: boolean;
    completionNotifications: boolean;
  };
}

const initialSettings: FactorySettings = {
  branding: {
    factoryName: 'Demo Factory',
    logo: '',
    primaryColor: '#059669',
    secondaryColor: '#475569',
  },
  workSchedule: {
    workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startTime: '08:00',
    endTime: '17:00',
    breakDuration: 60,
    holidays: ['2024-12-25', '2024-01-01'],
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    taskReminders: true,
    overdueAlerts: true,
    completionNotifications: true,
  },
};

const weekDays = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export const FactorySettingsPage = () => {
  const [settings, setSettings] = useState<FactorySettings>(initialSettings);
  const [newHoliday, setNewHoliday] = useState('');
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
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
  const { user, tenant: authTenant } = useAuthStore();
  const updateTenant = useAuthStore((s) => s.updateTenant);
  const updateUser = useAuthStore((s) => s.updateUser);
  
  // Fetch real tenant data
  console.log('Settings page - user:', user);
  console.log('Settings page - user?.tenantId:', user?.tenantId);
  console.log('Settings page - user?.tenantId type:', typeof user?.tenantId);
  console.log('Settings page - user?.tenantId stringified:', JSON.stringify(user?.tenantId));
  
  // Extract tenant ID properly - handle both string and object cases
  let tenantId: string | undefined;
  
  if (typeof user?.tenantId === 'string') {
    tenantId = user.tenantId;
    console.log('Settings page - tenantId is string:', tenantId);
  } else if (user?.tenantId && typeof user.tenantId === 'object') {
    // Handle both _id and id properties
    const tenantObj = user.tenantId as TenantObject;
    tenantId = tenantObj._id || tenantObj.id;
    console.log('Settings page - tenantId extracted from object:', tenantId);
    console.log('Settings page - tenantObj:', tenantObj);
  } else {
    console.log('Settings page - tenantId is undefined or invalid');
  }

  // Additional debugging for tenant ID extraction
  console.log('Settings page - user?.tenantId parsed:', JSON.parse(JSON.stringify(user?.tenantId)));
  if (user?.tenantId && typeof user.tenantId === 'object') {
    console.log('Settings page - user.tenantId keys:', Object.keys(user.tenantId));
    console.log('Settings page - user.tenantId values:', Object.values(user.tenantId));
  }
  
  console.log('Settings page - extracted tenantId:', tenantId);
  console.log('Settings page - tenantId type:', typeof tenantId);
  
  const { data: tenant, isLoading, error } = useTenant(tenantId && tenantId !== '[object Object]' ? tenantId : undefined);
  
  console.log('Settings page - tenant query result:', { tenant, isLoading, error });
  const updateTenantMutation = useUpdateTenant();
  const updateUserMutation = useUpdateUser();
  const changePasswordMutation = useChangePassword();

  // Update settings and admin profile when data loads
  useEffect(() => {
    console.log('Settings page - tenant data:', tenant);
    console.log('Settings page - auth tenant data:', authTenant);
    console.log('Settings page - user data:', user);
    
    // Initialize factory name from tenant data (API or auth store)
    if (tenant?.data?.factoryName) {
      setSettings(prev => ({
        ...prev,
        branding: {
          ...prev.branding,
          factoryName: tenant.data.factoryName,
        },
      }));
    } else if (authTenant?.factoryName) {
      // Fallback to auth store tenant data
      setSettings(prev => ({
        ...prev,
        branding: {
          ...prev.branding,
          factoryName: authTenant.factoryName,
        },
      }));
    }
    
    // Initialize admin profile from user data
    if (user) {
      setAdminProfile({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        autoId: user.autoId || '',
      });
    }
  }, [tenant, authTenant, user]);

  const handleSaveBranding = async () => {
    const effectiveTenantId = tenantId && tenantId !== '[object Object]' ? tenantId : authTenant?.id;
    
    if (!effectiveTenantId) {
      toast({ 
        title: 'Error', 
        description: 'Unable to save settings - no valid tenant ID',
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await updateTenantMutation.mutateAsync({
        tenantId: effectiveTenantId,
        tenantData: {
          factoryName: settings.branding.factoryName,
        }
      });
      
      // Update local auth store with the updated tenant data
      if (result?.data) {
        updateTenant(result.data);
        toast({
          title: 'Branding Updated',
          description: 'Factory branding has been updated successfully.',
        });
      }
    } catch (error) {
      console.error('Save branding error:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update factory branding. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleSaveProfile = async () => {
    const userId = user?.id || (user as UserObject)?._id;
    
    if (!userId) {
      toast({
        title: 'Error',
        description: 'Unable to save profile - user ID not found',
        variant: 'destructive'
      });
      return;
    }

    console.log('Settings - handleSaveProfile - userId:', userId);
    console.log('Settings - handleSaveProfile - adminProfile:', adminProfile);
    console.log('Settings - handleSaveProfile - user object:', user);

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
      const result = await updateUserMutation.mutateAsync({
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
          description: 'Your profile has been updated successfully.',
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
    
    console.log('Settings - handleChangePassword - user object:', user);
    console.log('Settings - handleChangePassword - extracted userId:', userId);
    
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

    console.log('Settings - handleChangePassword - userId:', userId);
    console.log('Settings - handleChangePassword - passwordData:', passwordData);

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
        description: 'Your password has been changed successfully.',
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

  const updateBranding = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        [field]: value,
      },
    }));
  };

  const updateAdminProfile = (field: keyof AdminProfile, value: string) => {
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

  const updateWorkSchedule = (field: string, value: string[] | string | number) => {
    setSettings(prev => ({
      ...prev,
      workSchedule: {
        ...prev.workSchedule,
        [field]: value,
      },
    }));
  };

  const updateNotifications = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }));
  };

  const toggleWorkDay = (day: string) => {
    const currentDays = settings.workSchedule.workDays;
    const updatedDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    updateWorkSchedule('workDays', updatedDays);
  };

  const addHoliday = () => {
    if (newHoliday) {
      const updatedHolidays = [...settings.workSchedule.holidays, newHoliday];
      updateWorkSchedule('holidays', updatedHolidays);
      setNewHoliday('');
    }
  };

  const removeHoliday = (holiday: string) => {
    const updatedHolidays = settings.workSchedule.holidays.filter(h => h !== holiday);
    updateWorkSchedule('holidays', updatedHolidays);
  };

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading factory settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Factory Settings</h1>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
            <TabsTrigger value="profile" className="text-xs md:text-sm px-2 py-2">
              Admin Profile
            </TabsTrigger>
            <TabsTrigger value="branding" className="text-xs md:text-sm px-2 py-2">
              Branding
            </TabsTrigger>
            <TabsTrigger value="schedule" className="text-xs md:text-sm px-2 py-2">
              Work Schedule
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs md:text-sm px-2 py-2">
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <User className="h-5 w-5" />
                  Admin Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="text-lg bg-emerald-100 text-emerald-700">
                      {adminProfile.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-slate-900">{adminProfile.name || 'Admin'}</h3>
                    <p className="text-sm text-slate-500">Factory Administrator</p>
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
                  disabled={updateUserMutation.isPending}
                  className="w-full md:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateUserMutation.isPending ? 'Updating...' : 'Update Profile'}
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

          <TabsContent value="branding" className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Palette className="h-5 w-5" />
                  Branding & Theme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="factoryName" className="text-slate-700">Factory Name</Label>
                  <Input
                    id="factoryName"
                    value={settings.branding.factoryName}
                    onChange={(e) => updateBranding('factoryName', e.target.value)}
                    className="border-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo" className="text-slate-700">Factory Logo</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="logo"
                      placeholder="Logo URL"
                      value={settings.branding.logo}
                      onChange={(e) => updateBranding('logo', e.target.value)}
                      className="border-slate-300"
                    />
                    <Button variant="outline" size="sm" className="border-slate-300">
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor" className="text-slate-700">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={settings.branding.primaryColor}
                        onChange={(e) => updateBranding('primaryColor', e.target.value)}
                        className="w-20 h-10 border-slate-300"
                      />
                      <Input
                        value={settings.branding.primaryColor}
                        onChange={(e) => updateBranding('primaryColor', e.target.value)}
                        className="flex-1 border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor" className="text-slate-700">Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={settings.branding.secondaryColor}
                        onChange={(e) => updateBranding('secondaryColor', e.target.value)}
                        className="w-20 h-10 border-slate-300"
                      />
                      <Input
                        value={settings.branding.secondaryColor}
                        onChange={(e) => updateBranding('secondaryColor', e.target.value)}
                        className="flex-1 border-slate-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-medium mb-2 text-slate-900">Preview</h4>
                  <div className="space-y-2">
                    <div 
                      className="h-8 rounded"
                      style={{ backgroundColor: settings.branding.primaryColor }}
                    />
                    <div 
                      className="h-4 rounded"
                      style={{ backgroundColor: settings.branding.secondaryColor }}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSaveBranding}
                  disabled={updateTenantMutation.isPending}
                  className="w-full md:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateTenantMutation.isPending ? 'Saving...' : 'Save Branding'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Calendar className="h-5 w-5" />
                  Work Schedule & Holidays
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900">Work Days</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {weekDays.map((day) => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={day.value}
                          checked={settings.workSchedule.workDays.includes(day.value)}
                          onChange={() => toggleWorkDay(day.value)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={day.value} className="text-slate-700">{day.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime" className="text-slate-700">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={settings.workSchedule.startTime}
                      onChange={(e) => updateWorkSchedule('startTime', e.target.value)}
                      className="border-slate-3কিন্ত00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime" className="text-slate-700">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={settings.workSchedule.endTime}
                      onChange={(e) => updateWorkSchedule('endTime', e.target.value)}
                      className="border-slate-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breakDuration" className="text-slate-700">Break Duration (minutes)</Label>
                  <Input
                    id="breakDuration"
                    type="number"
                    value={settings.workSchedule.breakDuration}
                    onChange={(e) => updateWorkSchedule('breakDuration', parseInt(e.target.value))}
                    min={15}
                    max={180}
                    className="border-slate-300"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900">Holidays</h4>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={newHoliday}
                      onChange={(e) => setNewHoliday(e.target.value)}
                      className="flex-1 border-slate-300"
                    />
                    <Button onClick={addHoliday} variant="outline" className="border-slate-300">
                      Add Holiday
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {settings.workSchedule.holidays.map((holiday) => (
                      <div key={holiday} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                        <span className="text-slate-900">{new Date(holiday).toLocaleDateString()}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeHoliday(holiday)}
                          className="border-slate-300"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications" className="text-slate-900">Email Notifications</Label>
                      <p className="text-sm text-slate-600">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => updateNotifications('emailNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotifications" className="text-slate-900">SMS Notifications</Label>
                      <p className="text-sm text-slate-600">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={settings.notifications.smsNotifications}
                      onCheckedChange={(checked) => updateNotifications('smsNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="taskReminders" className="text-slate-900">Task Reminders</Label>
                      <p className="text-sm text-slate-600">Get reminders for upcoming tasks</p>
                    </div>
                    <Switch
                      id="taskReminders"
                      checked={settings.notifications.taskReminders}
                      onCheckedChange={(checked) => updateNotifications('taskReminders', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="overdueAlerts" className="text-slate-900">Overdue Alerts</Label>
                      <p className="text-sm text-slate-600">Get alerts for overdue tasks</p>
                    </div>
                    <Switch
                      id="overdueAlerts"
                      checked={settings.notifications.overdueAlerts}
                      onCheckedChange={(checked) => updateNotifications('overdueAlerts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="completionNotifications" className="text-slate-900">Completion Notifications</Label>
                      <p className="text-sm text-slate-600">Get notified when tasks are completed</p>
                    </div>
                    <Switch
                      id="completionNotifications"
                      checked={settings.notifications.completionNotifications}
                      onCheckedChange={(checked) => updateNotifications('completionNotifications', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
};
