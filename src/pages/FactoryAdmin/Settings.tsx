import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Palette, Calendar, Bell, Upload, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuthStore } from '@/stores/auth';

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
  const { toast } = useToast();
  const updateTenant = useAuthStore((s) => s.updateTenant);

  const handleSave = () => {
    // TODO: API call to save settings
    // Immediately reflect changes in UI (header) by updating tenant in auth store
    if (settings.branding.factoryName) {
      updateTenant({ factoryName: settings.branding.factoryName });
    }
    toast({ title: 'Settings saved successfully' });
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

  const updateWorkSchedule = (field: string, value: any) => {
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

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Factory Settings</h1>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="schedule">Work Schedule</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

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
    </MobileLayout>
  );
};
