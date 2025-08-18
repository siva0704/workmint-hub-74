import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfWeek, addWeeks, subWeeks, getWeek, getYear } from 'date-fns';

interface WeekPickerFormProps {
  selectedWeek?: string; // ISO week format: "2024-W03"
  onWeekSelect: (week: string) => void;
  minWeek?: string;
  maxWeek?: string;
}

export const WeekPickerForm = ({ 
  selectedWeek, 
  onWeekSelect, 
  minWeek, 
  maxWeek 
}: WeekPickerFormProps) => {
  const [currentDate, setCurrentDate] = useState(() => {
    if (selectedWeek) {
      const [year, week] = selectedWeek.split('-W');
      const date = new Date(parseInt(year), 0, 1 + (parseInt(week) - 1) * 7);
      return startOfWeek(date, { weekStartsOn: 1 }); // Monday start
    }
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  });

  const formatWeekISO = (date: Date): string => {
    const year = getYear(date);
    const week = getWeek(date, { weekStartsOn: 1 });
    return `${year}-W${String(week).padStart(2, '0')}`;
  };

  const formatWeekDisplay = (date: Date): string => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
  };

  const handlePrevWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };

  const handleSelectWeek = () => {
    const isoWeek = formatWeekISO(currentDate);
    onWeekSelect(isoWeek);
  };

  const currentISOWeek = formatWeekISO(currentDate);
  const isSelected = selectedWeek === currentISOWeek;

  // Check if current week is within bounds
  const isWithinBounds = () => {
    if (minWeek && currentISOWeek < minWeek) return false;
    if (maxWeek && currentISOWeek > maxWeek) return false;
    return true;
  };

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevWeek}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="text-center">
            <div className="font-semibold text-sm">Week {getWeek(currentDate, { weekStartsOn: 1 })}</div>
            <div className="text-xs text-muted-foreground">{formatWeekDisplay(currentDate)}</div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextWeek}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-center space-y-2">
          <div className="text-sm text-muted-foreground">
            ISO Week: {currentISOWeek}
          </div>
          
          <Button
            onClick={handleSelectWeek}
            disabled={!isWithinBounds()}
            className={`w-full ${isSelected ? 'bg-accent' : ''}`}
            variant={isSelected ? 'default' : 'outline'}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {isSelected ? 'Selected' : 'Select This Week'}
          </Button>
          
          {!isWithinBounds() && (
            <div className="text-xs text-destructive">
              Week is outside allowed range
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};