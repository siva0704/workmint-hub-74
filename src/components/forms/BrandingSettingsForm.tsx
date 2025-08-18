
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Upload, Save, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BrandingSettings {
  factoryName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

const initialSettings: BrandingSettings = {
  factoryName: 'Demo Factory',
  logo: '',
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  accentColor: '#059669',
};

export const BrandingSettingsForm = () => {
  const [settings, setSettings] = useState<BrandingSettings>(initialSettings);
  const { toast } = useToast();

  const handleSave = () => {
    // TODO: API call to save branding settings
    toast({ title: 'Branding settings saved successfully' });
  };

  const updateSetting = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Handle file upload
      const url = URL.createObjectURL(file);
      updateSetting('logo', url);
      toast({ title: 'Logo uploaded successfully' });
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Branding & Theme Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="factoryName">Factory Name</Label>
          <Input
            id="factoryName"
            value={settings.factoryName}
            onChange={(e) => updateSetting('factoryName', e.target.value)}
            placeholder="Enter factory name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo">Factory Logo</Label>
          <div className="flex items-center gap-4">
            {settings.logo && (
              <div className="w-16 h-16 border rounded-lg overflow-hidden">
                <img
                  src={settings.logo}
                  alt="Factory Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('logo')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Logo
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Color Theme</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => updateSetting('primaryColor', e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => updateSetting('primaryColor', e.target.value)}
                  className="flex-1"
                  placeholder="#2563eb"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  value={settings.secondaryColor}
                  onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                  className="flex-1"
                  placeholder="#64748b"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="accentColor"
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => updateSetting('accentColor', e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  value={settings.accentColor}
                  onChange={(e) => updateSetting('accentColor', e.target.value)}
                  className="flex-1"
                  placeholder="#059669"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <h4 className="font-medium">Preview</h4>
          </div>
          <div className="p-4 border rounded-lg space-y-2">
            <div 
              className="h-8 rounded"
              style={{ backgroundColor: settings.primaryColor }}
            />
            <div 
              className="h-4 rounded"
              style={{ backgroundColor: settings.secondaryColor }}
            />
            <div 
              className="h-4 rounded w-1/2"
              style={{ backgroundColor: settings.accentColor }}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            Reset to Default
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
