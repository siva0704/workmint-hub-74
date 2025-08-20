import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled
      className="h-9 w-9 rounded-md opacity-50 cursor-not-allowed"
      aria-label="Theme toggle (disabled - light theme only)"
      title="Dark theme temporarily disabled"
    >
      <Sun className="h-4 w-4" />
      <span className="sr-only">Theme toggle (disabled)</span>
    </Button>
  );
}
