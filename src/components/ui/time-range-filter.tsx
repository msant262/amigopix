import React from 'react';
import { motion } from 'framer-motion';
import { ModernButton } from '@/components/ui/modern-button';
import { cn } from '@/lib/utils';

export type TimeRange = '1d' | '7d' | '30d' | '90d' | 'all';

interface TimeRangeFilterProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'pills';
}

const timeRangeOptions: { value: TimeRange; label: string; shortLabel: string }[] = [
  { value: '1d', label: '1 dia', shortLabel: '1d' },
  { value: '7d', label: '7 dias', shortLabel: '7d' },
  { value: '30d', label: '30 dias', shortLabel: '30d' },
  { value: '90d', label: '90 dias', shortLabel: '90d' },
  { value: 'all', label: 'Todos', shortLabel: 'Todos' },
];

export const TimeRangeFilter: React.FC<TimeRangeFilterProps> = ({
  value,
  onChange,
  className,
  size = 'sm',
  variant = 'default'
}) => {
  const sizes = {
    sm: 'h-8 px-2 sm:px-3 text-xs',
    md: 'h-10 px-3 sm:px-4 text-sm',
    lg: 'h-12 px-4 sm:px-6 text-base'
  };

  if (variant === 'pills') {
    return (
      <div className={cn("flex items-center space-x-1", className)}>
        {timeRangeOptions.map((option, index) => (
          <motion.button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
              "hover:scale-105 active:scale-95",
              value === option.value
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {option.shortLabel}
          </motion.button>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center space-x-1", className)}>
        {timeRangeOptions.map((option, index) => (
          <ModernButton
            key={option.value}
            variant={value === option.value ? 'gradient' : 'ghost'}
            size={size}
            onClick={() => onChange(option.value)}
            className={cn(sizes[size], "whitespace-nowrap")}
            delay={index * 0.05}
          >
            {option.shortLabel}
          </ModernButton>
        ))}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("flex items-center justify-center sm:justify-start", className)}>
      <div className="flex items-center space-x-1 bg-muted/50 backdrop-blur-sm rounded-lg p-1 border border-border/50 overflow-x-auto">
        <div className="flex space-x-1 min-w-max">
          {timeRangeOptions.map((option, index) => (
            <ModernButton
              key={option.value}
              variant={value === option.value ? 'gradient' : 'ghost'}
              size={size}
              onClick={() => onChange(option.value)}
              className={cn(sizes[size], "whitespace-nowrap flex-shrink-0")}
              delay={index * 0.05}
            >
              {option.label}
            </ModernButton>
          ))}
        </div>
      </div>
    </div>
  );
};

interface TimeRangeDisplayProps {
  value: TimeRange;
  className?: string;
}

export const TimeRangeDisplay: React.FC<TimeRangeDisplayProps> = ({
  value,
  className
}) => {
  const getDisplayText = (range: TimeRange) => {
    switch (range) {
      case '1d': return 'último dia';
      case '7d': return 'últimos 7 dias';
      case '30d': return 'últimos 30 dias';
      case '90d': return 'últimos 90 dias';
      case 'all': return 'todos os períodos';
      default: return '';
    }
  };

  if (value === 'all') return null;

  return (
    <span className={cn("text-primary font-medium", className)}>
      • {getDisplayText(value)}
    </span>
  );
};
