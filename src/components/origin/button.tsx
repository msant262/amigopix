import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const originButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-target relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary-500/90 to-primary-600/90 text-primary-foreground hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 backdrop-blur-sm",
        destructive: "bg-gradient-to-r from-red-500/90 to-red-600/90 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 backdrop-blur-sm",
        outline: "border-2 border-primary-200/50 bg-background/50 text-primary-600 hover:bg-primary-500/10 hover:border-primary-300/70 transform hover:-translate-y-0.5 backdrop-blur-sm",
        secondary: "bg-gradient-to-r from-secondary-500/90 to-secondary-600/90 text-secondary-foreground hover:from-secondary-600 hover:to-secondary-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 backdrop-blur-sm",
        ghost: "hover:bg-primary-500/10 hover:text-primary-600 text-muted-foreground backdrop-blur-sm",
        link: "text-primary-600 underline-offset-4 hover:underline hover:text-primary-700",
        accent: "bg-gradient-to-r from-accent-500/90 to-accent-600/90 text-accent-foreground hover:from-accent-600 hover:to-accent-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 backdrop-blur-sm",
        success: "bg-gradient-to-r from-green-500/90 to-green-600/90 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 backdrop-blur-sm",
        warning: "bg-gradient-to-r from-orange-500/90 to-orange-600/90 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 backdrop-blur-sm",
        info: "bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 backdrop-blur-sm",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-13 rounded-xl px-8 text-base",
        xl: "h-15 rounded-2xl px-10 text-lg",
        icon: "h-11 w-11 rounded-xl",
        "icon-sm": "h-9 w-9 rounded-lg",
        "icon-lg": "h-13 w-13 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface OriginButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof originButtonVariants> {
  asChild?: boolean
  loading?: boolean
  ripple?: boolean
}

const OriginButton = React.forwardRef<HTMLButtonElement, OriginButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, ripple = true, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple) {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const newRipple = { x, y, id: Date.now() }
        
        setRipples(prev => [...prev, newRipple])
        
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== newRipple.id))
        }, 600)
      }
      
      props.onClick?.(e)
    }

    return (
      <Comp
        className={cn(originButtonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        disabled={loading || props.disabled}
        {...props}
      >
        {/* Ripple effect */}
        {ripple && ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full pointer-events-none"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
          />
        ))}
        
        {/* Loading spinner */}
        {loading && (
          <motion.div
            className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        
        {children}
      </Comp>
    )
  }
)
OriginButton.displayName = "OriginButton"

export { OriginButton, originButtonVariants }
