
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { useLogin } from '@/hooks/useApi';
import { Eye, EyeOff, AlertCircle, Factory } from 'lucide-react';

export const Login = () => {
  const [loginType, setLoginType] = useState<'email' | 'autoId'>('email');
  const [formData, setFormData] = useState({
    email: '',
    autoId: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login: authLogin } = useAuthStore();
  const loginMutation = useLogin();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const loginData = loginType === 'email' 
        ? { email: formData.email, password: formData.password }
        : { autoId: formData.autoId, password: formData.password };
        
      const response = await loginMutation.mutateAsync(loginData);
      
      // Login with tokens
      authLogin(
        response.data.user, 
        response.data.tenant,
        response.data.refreshToken ? {
          token: response.data.token,
          refreshToken: response.data.refreshToken,
        } : undefined
      );
      
      // Navigate to role-specific dashboard
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Invalid email or password');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // Clear error when user starts typing
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

              {/* Login Type Toggle */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                <Button
                  type="button"
                  variant={loginType === 'email' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setLoginType('email')}
                >
                  Factory Admin
                </Button>
                <Button
                  type="button"
                  variant={loginType === 'autoId' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setLoginType('autoId')}
                >
                  Employee/Supervisor
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor={loginType} className="text-slate-700">
                  {loginType === 'email' ? 'Email' : 'Auto ID'}
                </Label>
                <Input
                  id={loginType}
                  name={loginType}
                  type={loginType === 'email' ? 'email' : 'text'}
                  value={loginType === 'email' ? formData.email : formData.autoId}
                  onChange={handleInputChange}
                  placeholder={loginType === 'email' ? 'admin@factory.com' : 'FA001'}
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


      </div>
    </div>
  );
};
