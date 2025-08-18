
import { Clock, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export const PendingApproval = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-mint-fresh/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <div className="w-20 h-20 bg-productivity-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="h-10 w-10 text-productivity-orange" />
          </div>
          
          <h1 className="text-2xl font-bold text-factory-dark mb-4">
            We're Reviewing Your Factory
          </h1>
          
          <p className="text-factory-medium mb-6 leading-relaxed">
            Your factory registration is currently under review by our team. 
            We'll notify you via email once your account has been approved.
          </p>

          <div className="bg-mint-fresh/5 border border-mint-fresh/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-mint-fresh" />
              <div className="text-left">
                <p className="font-medium text-factory-dark">Factory Registration</p>
                <p className="text-sm text-factory-medium">Status: Pending Approval</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-mint-fresh hover:bg-mint-fresh/90 text-white tap-target"
            >
              Try Signing In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full tap-target"
            >
              Back to Home
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-factory-light">
              Questions? Contact us at{' '}
              <a href="mailto:support@workmint.com" className="text-mint-fresh hover:underline">
                support@workmint.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
