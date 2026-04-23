import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Button } from './Button';

// helper for date logic
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

interface DateTimePickerProps {
  value?: string; // ISO string
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

export function DateTimePicker({ value, onChange, placeholder = "Select date & time", className, error }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use current date as basis if value is empty
  const initialDate = useMemo(() => value ? new Date(value) : new Date(), [value]);
  const [viewDate, setViewDate] = useState(new Date(initialDate));
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const result = [];
    // Padding from previous month
    for (let i = 0; i < firstDay; i++) {
        result.push({ day: null, currentMonth: false });
    }
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
        result.push({ day: i, currentMonth: true });
    }
    return result;
  }, [viewDate]);

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate);
    newDate.setDate(day);
    // Preserve time if already selected, otherwise default to current time
    if (selectedDate) {
        newDate.setHours(selectedDate.getHours());
        newDate.setMinutes(selectedDate.getMinutes());
    } else {
        const now = new Date();
        newDate.setHours(now.getHours());
        newDate.setMinutes(now.getMinutes());
    }
    setSelectedDate(newDate);
    onChange(newDate.toISOString());
  };

  const handleTimeChange = (type: 'hours' | 'minutes', val: number) => {
    const newDate = selectedDate ? new Date(selectedDate) : new Date();
    if (type === 'hours') newDate.setHours(val);
    else newDate.setMinutes(val);
    setSelectedDate(newDate);
    onChange(newDate.toISOString());
  };

  const formattedValue = selectedDate 
    ? selectedDate.toLocaleString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      })
    : "";

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border bg-surface px-3 py-2 text-sm cursor-pointer transition-all hover:border-primary/50",
          error ? "border-danger" : "border-secondary/20",
          isOpen && "ring-2 ring-primary border-primary shadow-[0_0_15px_rgba(59,130,246,0.15)]"
        )}
      >
        <span className={selectedDate ? "text-slate-900" : "text-secondary/50 font-medium"}>
          {formattedValue || placeholder}
        </span>
        <CalendarIcon size={16} className="text-secondary/40" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 top-full left-0 mt-2 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 p-5 w-[300px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <button 
                type="button"
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-primary"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="text-sm font-bold text-slate-800 tracking-tight">
                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
              </div>
              <button 
                type="button"
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-primary"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {days.map(d => (
                <div key={d} className="text-[10px] uppercase font-bold text-slate-300 text-center py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((item, i) => {
                const isSelected = selectedDate && item.day && 
                  selectedDate.getDate() === item.day && 
                  selectedDate.getMonth() === viewDate.getMonth() && 
                  selectedDate.getFullYear() === viewDate.getFullYear();
                
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!item.day}
                    onClick={() => item.day && handleDateSelect(item.day)}
                    className={cn(
                      "h-9 text-xs rounded-xl flex items-center justify-center transition-all relative",
                      !item.day && "opacity-0 cursor-default",
                      item.day && !isSelected && "hover:bg-slate-50 text-slate-600 font-medium",
                      isSelected && "bg-primary text-white font-bold shadow-lg shadow-primary/30 z-10"
                    )}
                  >
                    {item.day}
                    {isSelected && (
                      <motion.div 
                        layoutId="activeDay"
                        className="absolute inset-0 bg-primary rounded-xl -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Time Picker Section */}
            <div className="mt-5 pt-5 border-t border-slate-50">
              <div className="flex items-center gap-2 mb-3 text-[10px] uppercase font-extrabold text-slate-400 tracking-widest">
                <Clock size={12} className="text-primary/60" />
                <span>Set Time</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 space-y-1.5">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Hours</div>
                  <select 
                    value={selectedDate?.getHours() || 0} 
                    onChange={(e) => handleTimeChange('hours', parseInt(e.target.value))}
                    className="w-full bg-slate-50 border-none rounded-xl px-2 py-2 text-sm font-semibold text-slate-700 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-primary/20 transition-all appearance-none text-center"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
                <div className="text-slate-300 pt-5 font-bold">:</div>
                <div className="flex-1 space-y-1.5">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Minutes</div>
                  <select 
                    value={selectedDate?.getMinutes() || 0} 
                    onChange={(e) => handleTimeChange('minutes', parseInt(e.target.value))}
                    className="w-full bg-slate-50 border-none rounded-xl px-2 py-2 text-sm font-semibold text-slate-700 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-primary/20 transition-all appearance-none text-center"
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 pt-5">
                   <Button 
                    size="sm" 
                    className="w-full h-9 rounded-xl text-xs font-bold" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
