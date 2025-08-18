
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Clock, FileText, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GlobalSettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
  };
  dataRetention: {
    taskDataMonths: number;
    auditLogMonths: number;
    userDataYears: number;
    autoArchive: boolean;
  };
  auditLog: {
    enableLogging: boolean;
    logLevel: 'basic' | 'detailed' | 'comprehensive';
    retentionMonths: number;
    exportFormat: 'json' | 'csv' | 'pdf';
  };
}

const initialSettings: GlobalSettings = {
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    expiryDays: 90,
  },
  dataRetention: {
    taskDataMonths: 12,
    auditLogMonths: 24,
    userDataYears: 7,
    autoArchive: true,
  },
  auditLog: {
    enableLogging: true,
    logLevel: 'detailed',
    retentionMonths: 24,
    exportFormat: 'json',
  },
};

export const GlobalSettingsForm = () => {
  const [settings, setSettings] = useState<GlobalSettings>(initialSettings);
  const { toast } = useToast();

  const handleSave = () => {
    // TODO: API call to save global settings
    toast({ title: 'Global settings saved successfully' });
  };

  const updatePasswordPolicy = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      passwordPolicy: {
        ...prev.passwordPolicy,
        [field]: value,
      },
    }));
  };

  const updateDataRetention = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      dataRetention: {
        ...prev.dataRetention,
        [field]: value,
      },
    }));
  };

  const updateAuditLog = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      auditLog: {
        ...prev.auditLog,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Global Settings</h1>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="password" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="password">Password Policy</TabsTrigger>
          <TabsTrigger value="retention">Data Retention</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="password" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Password Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minLength">Minimum Length</Label>
                  <Input
                    id="minLength"
                    type="number"
                    min={6}
                    max={50}
                    value={settings.passwordPolicy.minLength}
                    onChange={(e) => updatePasswordPolicy('minLength', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDays">Password Expiry (Days)</Label>
                  <Input
                    id="expiryDays"
                    type="number"
                    min={0}
                    max={365}
                    value={settings.passwordPolicy.expiryDays}
                    onChange={(e) => updatePasswordPolicy('expiryDays', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
                  <Switch
                    id="requireUppercase"
                    checked={settings.passwordPolicy.requireUppercase}
                    onCheckedChange={(checked) => updatePasswordPolicy('requireUppercase', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="requireLowercase">Require Lowercase Letters</Label>
                  <Switch
                    id="requireLowercase"
                    checked={settings.passwordPolicy.requireLowercase}
                    onCheckedChange={(checked) => updatePasswordPolicy('requireLowercase', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="requireNumbers">Require Numbers</Label>
                  <Switch
                    id="requireNumbers"
                    checked={settings.passwordPolicy.requireNumbers}
                    onCheckedChange={(checked) => updatePasswordPolicy('requireNumbers', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                  <Switch
                    id="requireSpecialChars"
                    checked={settings.passwordPolicy.requireSpecialChars}
                    onCheckedChange={(checked) => updatePasswordPolicy('requireSpecialChars', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Data Retention Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taskDataMonths">Task Data Retention (Months)</Label>
                  <Input
                    id="taskDataMonths"
                    type="number"
                    min={1}
                    max={120}
                    value={settings.dataRetention.taskDataMonths}
                    onChange={(e) => updateDataRetention('taskDataMonths', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auditLogMonths">Audit Log Retention (Months)</Label>
                  <Input
                    id="auditLogMonths"
                    type="number"
                    min={1}
                    max={120}
                    value={settings.dataRetention.auditLogMonths}
                    onChange={(e) => updateDataRetention('auditLogMonths', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userDataYears">User Data Retention (Years)</Label>
                  <Input
                    id="userDataYears"
                    type="number"
                    min={1}
                    max={20}
                    value={settings.dataRetention.userDataYears}
                    onChange={(e) => updateDataRetention('userDataYears', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoArchive">Auto Archive Old Data</Label>
                  <p className="text-sm text-muted-foreground">Automatically move old data to archive storage</p>
                </div>
                <Switch
                  id="autoArchive"
                  checked={settings.dataRetention.autoArchive}
                  onCheckedChange={(checked) => updateDataRetention('autoArchive', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit Log Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableLogging">Enable Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">Track all system activities and changes</p>
                </div>
                <Switch
                  id="enableLogging"
                  checked={settings.auditLog.enableLogging}
                  onCheckedChange={(checked) => updateAuditLog('enableLogging', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logLevel">Logging Level</Label>
                <Select
                  value={settings.auditLog.logLevel}
                  onValueChange={(value) => updateAuditLog('logLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retentionMonths">Log Retention (Months)</Label>
                <Input
                  id="retentionMonths"
                  type="number"
                  min={1}
                  max={120}
                  value={settings.auditLog.retentionMonths}
                  onChange={(e) => updateAuditLog('retentionMonths', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exportFormat">Export Format</Label>
                <Select
                  value={settings.auditLog.exportFormat}
                  onValueChange={(value) => updateAuditLog('exportFormat', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
