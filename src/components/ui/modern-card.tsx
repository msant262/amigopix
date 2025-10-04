import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ModernCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  icon?: React.ReactNode;
  delay?: number;
  onClick?: () => void;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  title,
  description,
  children,
  className,
  hover = true,
  gradient = true,
  icon,
  delay = 0,
  onClick: _onClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -2, scale: 1.02 } : {}}
      className="h-full"
    >
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300",
        gradient && "bg-gradient-to-br from-card to-card/80 border-border/50 shadow-lg",
        hover && "hover:shadow-xl hover:border-primary/20",
        className
      )}>
        {/* Subtle gradient overlay */}
        {gradient && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        )}
        
        {/* Content */}
        <div className="relative z-10">
          {(title || description || icon) && (
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  {title && (
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      {icon && (
                        <span className="text-primary">
                          {icon}
                        </span>
                      )}
                      {title}
                    </CardTitle>
                  )}
                  {description && (
                    <CardDescription className="text-sm">
                      {description}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
          )}
          <CardContent className={cn(
            title || description ? "pt-0" : "pt-6"
          )}>
            {children}
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend = 'neutral',
  color = 'text-primary',
  delay = 0
}) => {
  const trendColors = {
    up: 'text-accent',
    down: 'text-destructive',
    neutral: 'text-muted-foreground'
  };

  return (
    <ModernCard
      delay={delay}
      className="group"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl font-bold">
            {value}
          </p>
          {description && (
            <p className={cn(
              "text-xs",
              trendColors[trend]
            )}>
              {description}
            </p>
          )}
        </div>
        <div className={cn(
          "h-12 w-12 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110",
          color.includes('text-') ? color : `text-${color}`,
          "bg-gradient-to-br from-primary/10 to-secondary/10"
        )}>
          {icon}
        </div>
      </div>
    </ModernCard>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  delay?: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  onClick,
  delay = 0
}) => {
  return (
    <ModernCard
      delay={delay}
      hover={!!onClick}
      className={cn(
        "cursor-pointer",
        onClick && "hover:border-primary/30"
      )}
      onClick={onClick}
    >
      <div className="text-center space-y-4">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <span className="text-2xl text-primary">
            {icon}
          </span>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </ModernCard>
  );
};
