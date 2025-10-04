import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Eye, EyeOff } from "lucide-react";

const originInputVariants = cva(
  "flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-border/30 hover:border-primary-300/50 focus-visible:border-primary-500/70 bg-background/50 backdrop-blur-sm",
        filled:
          "border-transparent bg-primary-500/10 hover:bg-primary-500/15 focus-visible:bg-primary-500/15 focus-visible:ring-primary-500/50 backdrop-blur-sm",
        outlined:
          "border-2 border-primary-200/30 hover:border-primary-300/50 focus-visible:border-primary-500/70 bg-background/50 backdrop-blur-sm",
        ghost:
          "border-transparent bg-transparent hover:bg-primary-500/10 focus-visible:bg-primary-500/10 backdrop-blur-sm",
      },
      size: {
        default: "h-11 px-4 py-3",
        sm: "h-9 px-3 py-2 text-xs",
        lg: "h-13 px-6 py-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface OriginInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd'>,
    VariantProps<typeof originInputVariants> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

const OriginInput = React.forwardRef<HTMLInputElement, OriginInputProps>(
  (
    {
      className,
      variant,
      size,
      type = "text",
      label,
      error,
      helper,
      leftIcon,
      rightIcon,
      loading,
      id,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputId = id || React.useId();

    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          <motion.input
            id={inputId}
            type={inputType}
            className={cn(
              originInputVariants({ variant, size: size as "default" | "sm" | "lg" }),
              leftIcon && "pl-10",
              (rightIcon || isPassword || loading) && "pr-10",
              error && "border-red-500 focus-visible:ring-red-500",
              className,
            )}
            ref={ref}
            {...props}
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            {loading && (
              <motion.div
                className="h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            )}

            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}

            {rightIcon && !isPassword && !loading && (
              <div className="text-muted-foreground">{rightIcon}</div>
            )}
          </div>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 flex items-center"
          >
            {error}
          </motion.p>
        )}

        {helper && !error && (
          <p className="text-sm text-muted-foreground">{helper}</p>
        )}
      </div>
    );
  },
);
OriginInput.displayName = "OriginInput";

export { OriginInput };
