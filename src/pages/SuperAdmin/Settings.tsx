import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, Shield, Database, Bell, Users, Activity } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useToast } from '@/hooks/use-toast';

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

  const { toast } = useToast();

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

  const systemStats = {
    totalTenants: 45,
    totalUsers: 2850,
    systemUptime: '99.9%',
    storageUsed: '2.3 TB',
    activeConnections: 847
  };

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
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{systemStats.totalTenants}</p>
                <p className="text-sm text-muted-foreground">Total Tenants</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{systemStats.totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{systemStats.systemUptime}</p>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{systemStats.storageUsed}</p>
                <p className="text-sm text-muted-foreground">Storage Used</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Tabs defaultValue="security" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
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
