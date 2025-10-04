import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const originBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/80 text-primary-foreground hover:bg-primary/90 backdrop-blur-sm",
        secondary:
          "border-transparent bg-secondary/80 text-secondary-foreground hover:bg-secondary/90 backdrop-blur-sm",
        destructive:
          "border-transparent bg-red-500/80 text-white hover:bg-red-600/90 backdrop-blur-sm",
        outline:
          "text-foreground border-border/50 bg-background/50 backdrop-blur-sm",
        success:
          "border-transparent bg-green-500/80 text-white hover:bg-green-600/90 backdrop-blur-sm",
        warning:
          "border-transparent bg-orange-500/80 text-white hover:bg-orange-600/90 backdrop-blur-sm",
        info: "border-transparent bg-blue-500/80 text-white hover:bg-blue-600/90 backdrop-blur-sm",
        ghost:
          "border-transparent text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground backdrop-blur-sm",
        gradient:
          "border-transparent bg-gradient-to-r from-primary-500/80 to-primary-600/80 text-white backdrop-blur-sm",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
        ping: "animate-ping",
        spin: "animate-spin",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  },
);

export interface OriginBadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd'>,
    VariantProps<typeof originBadgeVariants> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  delay?: number;
}

const OriginBadge = React.forwardRef<HTMLDivElement, OriginBadgeProps>(
  (
    {
      className,
      variant,
      size,
      animation,
      children,
      icon,
      removable = false,
      onRemove,
      delay = 0,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, delay }}
        className={cn(
          originBadgeVariants({ variant, size, animation, className }),
        )}
        ref={ref}
        {...props}
      >
        {icon && <span className="mr-1 h-3 w-3">{icon}</span>}

        <span>{children}</span>

        {removable && (
          <button
            onClick={onRemove}
            className="ml-1 h-3 w-3 rounded-full hover:bg-black/20 transition-colors"
            aria-label="Remover"
          >
            <svg
              className="h-2 w-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </motion.div>
    );
  },
);
OriginBadge.displayName = "OriginBadge";

export { OriginBadge, originBadgeVariants };
