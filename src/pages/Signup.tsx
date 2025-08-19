
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Building2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { SignupForm } from '@/types';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export const Signup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<SignupForm>({
    factoryName: '',
    address: '',
    workersCount: 0,
    ownerEmail: '',
    phone: '',
    loginEmail: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const updateFormData = (field: keyof SignupForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
  
      await api.signup(formData);
      toast({
        title: 'Registration Submitted',
        description: 'Your factory registration has been submitted for approval.',
      });
      navigate('/pending-approval');
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'Failed to submit registration';
      
      // Check for validation errors first
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors.map((err: any) => `${err.path}: ${err.msg}`).join(', ');
        errorMessage = `Validation errors: ${validationErrors}`;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="factoryName">Factory Name</Label>
              <Input
                id="factoryName"
                placeholder="Enter your factory name"
                value={formData.factoryName}
                onChange={(e) => updateFormData('factoryName', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Enter factory address"
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="workersCount">Number of Workers</Label>
              <Input
                id="workersCount"
                type="number"
                placeholder="0"
                value={formData.workersCount || ''}
                onChange={(e) => updateFormData('workersCount', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="ownerEmail">Owner Email</Label>
              <Input
                id="ownerEmail"
                type="email"
                placeholder="owner@factory.com"
                value={formData.ownerEmail}
                onChange={(e) => updateFormData('ownerEmail', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="loginEmail">Login Email</Label>
              <Input
                id="loginEmail"
                type="email"
                placeholder="admin@factory.com"
                value={formData.loginEmail}
                onChange={(e) => updateFormData('loginEmail', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => updateFormData('acceptTerms', !!checked)}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the Terms & Conditions and Privacy Policy
              </Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = [
    'Factory Details',
    'Owner Contact',
    'Security Setup'
  ];

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.factoryName && formData.address && formData.workersCount > 0;
      case 2:
        return formData.ownerEmail && formData.phone;
      case 3:
        return formData.loginEmail && formData.password && 
               formData.confirmPassword && formData.password === formData.confirmPassword &&
               formData.acceptTerms;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-mint-fresh/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-factory-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-factory-dark">Create Factory Account</h1>
          <p className="text-factory-medium">Step {currentStep} of 3</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {stepTitles.map((title, index) => (
              <div
                key={index}
                className={`text-xs font-medium ${
                  index + 1 <= currentStep ? 'text-mint-fresh' : 'text-factory-light'
                }`}
              >
                {title}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-mint-fresh rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{stepTitles[currentStep - 1]}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderStep()}
            
            <div className="flex gap-3 mt-6">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="flex-1 tap-target"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              
              <Button
                onClick={() => {
                  if (currentStep < 3) {
                    setCurrentStep(prev => prev + 1);
                  } else {
                    handleSubmit();
                  }
                }}
                disabled={!isStepValid() || isSubmitting}
                className="flex-1 bg-mint-fresh hover:bg-mint-fresh/90 tap-target"
              >
                {currentStep < 3 ? (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>



        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-factory-medium">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-mint-fresh font-medium hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
