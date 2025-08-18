import { useState } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, getISOWeek } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WeekPickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  className?: string;
  placeholder?: string;
}

export const WeekPicker = ({ value, onChange, className, placeholder = "Select week" }: WeekPickerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(value || new Date());
  const [isOpen, setIsOpen] = useState(false);

  const currentWeekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start
  const currentWeekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekNumber = getISOWeek(selectedDate);

  const handlePreviousWeek = () => {
    const newDate = subWeeks(selectedDate, 1);
    setSelectedDate(newDate);
    onChange?.(newDate);
  };

  const handleNextWeek = () => {
    const newDate = addWeeks(selectedDate, 1);
    setSelectedDate(newDate);
    onChange?.(newDate);
  };

  const handleWeekSelect = (date: Date) => {
    setSelectedDate(date);
    onChange?.(date);
    setIsOpen(false);
  };

  const formatWeekRange = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  };

  const getWeeksInMonth = (baseDate: Date) => {
    const weeks = [];
    const monthStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    const monthEnd = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
    
    let current = startOfWeek(monthStart, { weekStartsOn: 1 });
    
    while (current <= monthEnd) {
      weeks.push(new Date(current));
      current = addWeeks(current, 1);
    }
    
    return weeks;
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !value && "text-muted-foreground"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar className="mr-2 h-4 w-4" />
        {value ? (
          <span>
            Week {weekNumber}: {formatWeekRange(selectedDate)}
          </span>
        ) : (
          <span>{placeholder}</span>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
          <CardContent className="p-4">
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousWeek}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-center">
                <div className="font-medium">Week {weekNumber}</div>
                <div className="text-sm text-muted-foreground">
                  {formatWeekRange(selectedDate)}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextWeek}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Week Selection */}
            <div className="grid grid-cols-1 gap-2">
              {getWeeksInMonth(selectedDate).map((weekDate, index) => {
                const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 });
                const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 });
                const isSelected = format(weekStart, 'yyyy-MM-dd') === format(currentWeekStart, 'yyyy-MM-dd');
                
                return (
                  <Button
                    key={index}
                    variant={isSelected ? "default" : "ghost"}
                    className="justify-start h-auto p-2"
                    onClick={() => handleWeekSelect(weekDate)}
                  >
                    <div className="text-left">
                      <div className="font-medium">
                        Week {getISOWeek(weekDate)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleWeekSelect(new Date())}
              >
                This Week
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};