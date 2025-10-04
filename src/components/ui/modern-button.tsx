import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ModernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  animated?: boolean;
  glow?: boolean;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  variant = 'default',
  size = 'default',
  loading = false,
  icon,
  iconPosition = 'left',
  animated = true,
  glow = false,
  className,
  disabled,
  ...props
}) => {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
    gradient: 'bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90'
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10'
  };

  const ButtonComponent = animated ? motion.button : 'button';

  return (
    <ButtonComponent
      {...(animated && {
        whileHover: { scale: 1.02, y: -1 },
        whileTap: { scale: 0.98 },
        transition: { duration: 0.2, ease: "easeInOut" }
      })}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        glow && "shadow-lg hover:shadow-xl shadow-primary/25",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {children}
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="mr-2">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="ml-2">{icon}</span>
          )}
        </>
      )}
    </ButtonComponent>
  );
};

interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onClick,
  label,
  position = 'bottom-right',
  size = 'md',
  color = 'primary'
}) => {
  const positions = {
    'bottom-right': 'fixed bottom-20 right-4 lg:bottom-6 lg:right-6',
    'bottom-left': 'fixed bottom-20 left-4 lg:bottom-6 lg:left-6',
    'top-right': 'fixed top-20 right-4 lg:top-6 lg:right-6',
    'top-left': 'fixed top-20 left-4 lg:top-6 lg:left-6'
  };

  const sizes_classes = {
    sm: 'h-12 w-12',
    md: 'h-14 w-14',
    lg: 'h-16 w-16'
  };

  const colors = {
    primary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    secondary: 'bg-secondary hover:bg-secondary/90 text-secondary-foreground',
    accent: 'bg-accent hover:bg-accent/90 text-accent-foreground'
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        positions[position],
        sizes_classes[size],
        colors[color]
      )}
      onClick={onClick}
      title={label}
    >
      <span className={cn(
        "flex items-center justify-center",
        size === 'sm' && "text-lg",
        size === 'md' && "text-xl",
        size === 'lg' && "text-2xl"
      )}>
        {icon}
      </span>
    </motion.button>
  );
};

interface IconButtonProps extends Omit<ModernButtonProps, 'icon' | 'iconPosition'> {
  icon: React.ReactNode;
  tooltip?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  tooltip,
  ...props
}) => {
  return (
    <ModernButton
      size="icon"
      {...props}
      title={tooltip}
    >
      {icon}
    </ModernButton>
  );
};
