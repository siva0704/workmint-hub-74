
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { mockLogin } from '@/stores/mockData';
import { Eye, EyeOff, AlertCircle, Factory } from 'lucide-react';

export const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { user, tenant } = await mockLogin(formData.email, formData.password);
      login(user, tenant);
      
      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.name}!`
      });
      
      // Navigate to role-specific dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const quickLoginOptions = [
    { email: 'superadmin@factory.com', role: 'Super Admin', password: 'password123' },
    { email: 'admin@demo-factory.com', role: 'Factory Admin', password: 'password123' },
    { email: 'supervisor@demo-factory.com', role: 'Supervisor', password: 'password123' },
    { email: 'employee@demo-factory.com', role: 'Employee', password: 'password123' }
  ];

  const quickLogin = (email: string) => {
    setFormData({ email, password: 'password123' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Factory className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Sign In</h1>
          <p className="text-slate-600 mt-2">Welcome back to Factory Management</p>
        </div>

        {/* Login Form */}
        <Card className="border-slate-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-slate-900">Login to your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="admin@factory.com"
                  required
                  className="border-slate-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                    className="border-slate-300 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="text-center mt-4">
              <Link 
                to="/signup" 
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Don't have an account? Create one
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Login Options for Testing */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Quick Login (Demo)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickLoginOptions.map((option) => (
              <Button
                key={option.email}
                variant="outline"
                size="sm"
                className="w-full justify-start text-left border-slate-300"
                onClick={() => quickLogin(option.email)}
              >
                <div>
                  <div className="font-medium text-slate-900">{option.role}</div>
                  <div className="text-xs text-slate-600">{option.email}</div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
