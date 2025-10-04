import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { OriginButton } from "./button";

const originModalVariants = cva(
  "fixed inset-0 z-50 flex items-center justify-center p-4",
  {
    variants: {
      size: {
        sm: "",
        default: "",
        lg: "",
        xl: "",
        full: "",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const originModalContentVariants = cva(
  "relative w-full max-w-lg rounded-2xl border bg-background shadow-2xl",
  {
    variants: {
      size: {
        sm: "max-w-sm",
        default: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-[95vw] h-[95vh]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export interface OriginModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof originModalVariants> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  loading?: boolean;
}

const OriginModal = React.forwardRef<HTMLDivElement, OriginModalProps>(
  (
    {
      className,
      size,
      open,
      onOpenChange,
      title,
      description,
      showCloseButton = true,
      closeOnOverlayClick = true,
      loading = false,
      children,
    },
    ref,
  ) => {
    const handleOverlayClick = (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onOpenChange(false);
      }
    };

    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && open) {
          onOpenChange(false);
        }
      };

      if (open) {
        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";
      }

      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "unset";
      };
    }, [open, onOpenChange]);

    return (
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(originModalVariants({ size }), className)}
            onClick={handleOverlayClick}
            ref={ref}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn(originModalContentVariants({ size }))}
            >
              {/* Header */}
              {(title || description || showCloseButton) && (
                <div className="flex items-center justify-between p-6 border-b">
                  <div className="space-y-1">
                    {title && (
                      <h2 className="text-xl font-semibold text-foreground">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="text-sm text-muted-foreground">
                        {description}
                      </p>
                    )}
                  </div>

                  {showCloseButton && (
                    <OriginButton
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onOpenChange(false)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </OriginButton>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-6">{children}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);
OriginModal.displayName = "OriginModal";

const OriginModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className,
    )}
    {...props}
  />
));
OriginModalHeader.displayName = "OriginModalHeader";

const OriginModalTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
OriginModalTitle.displayName = "OriginModalTitle";

const OriginModalDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
OriginModalDescription.displayName = "OriginModalDescription";

const OriginModalContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mt-4", className)} {...props} />
));
OriginModalContent.displayName = "OriginModalContent";

const OriginModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-6",
      className,
    )}
    {...props}
  />
));
OriginModalFooter.displayName = "OriginModalFooter";

export {
  OriginModal,
  OriginModalHeader,
  OriginModalFooter,
  OriginModalTitle,
  OriginModalDescription,
  OriginModalContent,
};
