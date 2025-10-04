import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const originCardVariants = cva(
  "rounded-2xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg",
  {
    variants: {
      variant: {
        default: "border-border/30 bg-card/50 backdrop-blur-sm",
        elevated: "border-border/20 bg-card/70 backdrop-blur-sm shadow-lg hover:shadow-xl",
        outlined: "border-2 border-primary-200/50 bg-card/50 backdrop-blur-sm",
        filled: "border-transparent bg-gradient-to-br from-primary-500/10 to-primary-600/10 backdrop-blur-sm",
        glass: "border-white/10 bg-white/5 backdrop-blur-md",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-1 hover:shadow-xl",
        scale: "hover:scale-[1.02] hover:shadow-xl",
        glow: "hover:shadow-2xl hover:shadow-primary-500/25",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      hover: "none",
    },
  }
)

export interface OriginCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof originCardVariants> {
  asChild?: boolean
  delay?: number
}

const OriginCard = React.forwardRef<HTMLDivElement, OriginCardProps>(
  ({ className, variant, padding, hover, delay = 0, children, ...props }, ref) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className={cn(originCardVariants({ variant, padding, hover, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
OriginCard.displayName = "OriginCard"

const OriginCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
))
OriginCardHeader.displayName = "OriginCardHeader"

const OriginCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-bold leading-none tracking-tight", className)}
    {...props}
  />
))
OriginCardTitle.displayName = "OriginCardTitle"

const OriginCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
))
OriginCardDescription.displayName = "OriginCardDescription"

const OriginCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
))
OriginCardContent.displayName = "OriginCardContent"

const OriginCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
))
OriginCardFooter.displayName = "OriginCardFooter"

export {
  OriginCard,
  OriginCardHeader,
  OriginCardFooter,
  OriginCardTitle,
  OriginCardDescription,
  OriginCardContent,
}
