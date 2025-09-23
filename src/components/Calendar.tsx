import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CalendarProps {
  onDateSelect: (date: Date) => void;
  appointments: Record<string, any[]>;
}

const Calendar: React.FC<CalendarProps> = ({ onDateSelect, appointments }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
  
  const days = [];
  const current = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(month + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };
  
  const getDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const getAppointmentCount = (date: Date) => {
    const dateKey = getDateKey(date);
    return appointments[dateKey]?.length || 0;
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto p-6 shadow-medium bg-gradient-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            {monthNames[month]} {year}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="h-9 w-9 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="h-9 w-9 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-semibold text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, index) => {
          const appointmentCount = getAppointmentCount(date);
          const isTodayDate = isToday(date);
          const isCurrentMonthDate = isCurrentMonth(date);
          
          return (
            <button
              key={index}
              onClick={() => onDateSelect(date)}
              className={cn(
                "relative min-h-[80px] p-2 rounded-lg transition-all duration-200 hover:shadow-soft",
                "border border-border hover:border-primary/50",
                "group cursor-pointer",
                {
                  "bg-card": isCurrentMonthDate,
                  "bg-muted/50": !isCurrentMonthDate,
                  "ring-2 ring-primary bg-primary/5": isTodayDate,
                  "opacity-50": !isCurrentMonthDate,
                }
              )}
            >
              <div className="text-left">
                <span
                  className={cn(
                    "text-sm font-medium",
                    {
                      "text-foreground": isCurrentMonthDate,
                      "text-muted-foreground": !isCurrentMonthDate,
                      "text-primary font-bold": isTodayDate,
                    }
                  )}
                >
                  {date.getDate()}
                </span>
              </div>
              
              {appointmentCount > 0 && (
                <div className="absolute bottom-2 right-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-success font-semibold">
                      {appointmentCount}
                    </span>
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                  </div>
                </div>
              )}
              
              {/* Hover indicator */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="h-3 w-3 text-primary" />
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

export default Calendar;