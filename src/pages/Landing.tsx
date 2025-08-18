
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Factory, Shield, Users, Zap, ArrowRight, Building2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const Landing = () => {
  const navigate = useNavigate();
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  const handleCreateAccount = () => {
    navigate('/signup');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleWatchDemo = () => {
    setIsPlayingDemo(true);
    // Simulate demo playing
    setTimeout(() => {
      setIsPlayingDemo(false);
      // After demo, redirect to signup
      navigate('/signup');
    }, 3000);
  };

  const features = [
    {
      icon: Factory,
      title: 'Smart Task Management',
      description: 'Assign, track, and complete tasks with real-time progress updates'
    },
    {
      icon: Users,
      title: 'Multi-Role Platform',
      description: 'Purpose-built interfaces for admins, supervisors, and employees'
    },
    {
      icon: Shield,
      title: 'Secure & Compliant',
      description: 'Multi-tenant architecture with enterprise-grade security'
    },
    {
      icon: Zap,
      title: 'Mobile-First Design',
      description: 'Optimized for factory floor use on any device'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="px-4 py-6 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-slate-600 rounded-xl flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">WorkMint Hub</span>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleSignIn}
            className="tap-target border-slate-300 hover:bg-slate-50"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            The Modern Factory
            <span className="block text-emerald-600">Management Platform</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Streamline your factory operations with intelligent task management, 
            real-time tracking, and mobile-first design built for the manufacturing floor.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 tap-target text-lg"
              onClick={handleCreateAccount}
            >
              Create Factory Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 tap-target text-lg"
              onClick={handleWatchDemo}
              disabled={isPlayingDemo}
            >
              {isPlayingDemo ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2"></div>
                  Playing Demo...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Built for Modern Manufacturing
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to manage your factory operations efficiently, 
              from task assignment to completion tracking.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Factory?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Join hundreds of factories already using WorkMint Hub to streamline their operations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 tap-target text-lg"
              onClick={handleCreateAccount}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="border-slate-300 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-4 tap-target text-lg"
              onClick={handleSignIn}
            >
              Sign In to Existing Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-600">
            © 2024 WorkMint Hub. Built for modern manufacturing.
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <button className="text-slate-500 hover:text-emerald-600 transition-colors">
              Privacy Policy
            </button>
            <button className="text-slate-500 hover:text-emerald-600 transition-colors">
              Terms of Service
            </button>
            <button className="text-slate-500 hover:text-emerald-600 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
