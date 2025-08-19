import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallCard = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallCard, setShowInstallCard] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      // Check if running in PWA mode
      if (window.navigator.standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    checkIfInstalled();

    // Always show the install card if not installed
    if (!isInstalled) {
      setShowInstallCard(true);
    }

    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallCard(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallCard(false);
      toast({
        title: 'Installation Successful',
        description: 'WorkMint has been installed successfully!',
      });
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [toast, isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Provide fallback instructions for manual installation
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      let instructions = 'You can install WorkMint manually from your browser menu.';
      
      if (isIOS) {
        instructions = 'Tap the Share button and select "Add to Home Screen" to install WorkMint.';
      } else if (isAndroid) {
        instructions = 'Tap the menu (⋮) and select "Install app" or "Add to Home screen".';
      } else {
        instructions = 'Click the install icon in your address bar or browser menu.';
      }
      
      toast({
        title: 'Manual Installation',
        description: instructions,
      });
      return;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallCard(false);
        toast({
          title: 'Installation Successful',
          description: 'WorkMint has been installed successfully!',
        });
      } else {
        toast({
          title: 'Installation Cancelled',
          description: 'You can install WorkMint later from your browser menu.',
        });
      }

      // Clear the deferredPrompt
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Installation error:', error);
      toast({
        title: 'Installation Failed',
        description: 'Failed to install WorkMint. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Don't show if already installed or if install prompt is not available
  if (isInstalled || !showInstallCard) {
    return null;
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1">
              Install WorkMint
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              Add WorkMint to your home screen for quick access and offline functionality.
            </p>
            
            <Button
              size="sm"
              onClick={handleInstallClick}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Install App
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
