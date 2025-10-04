import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ModernBadgeProps {
  children: React.ReactNode;
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
  animated?: boolean;
  pulse?: boolean;
}

export const ModernBadge: React.FC<ModernBadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className,
  animated = true,
  pulse = false,
}) => {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    success: "bg-accent text-accent-foreground hover:bg-accent/90",
    warning: "bg-orange-500 text-white hover:bg-orange-500/90",
    info: "bg-blue-500 text-white hover:bg-blue-500/90",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base",
  };

  const BadgeComponent = animated ? motion.div : "div";

  return (
    <BadgeComponent
      {...(animated && {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.2, ease: "easeOut" },
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 },
      })}
      className={cn(
        "inline-flex items-center rounded-full border font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        sizes[size],
        pulse && "animate-pulse",
        className,
      )}
    >
      {children}
    </BadgeComponent>
  );
};

interface StatusBadgeProps {
  status: "ativo" | "atrasado" | "quitado" | "pendente" | "cancelado";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
  animated = true,
}) => {
  const statusConfig = {
    ativo: {
      variant: "success" as const,
      text: "Ativo",
      icon: "🟢",
    },
    atrasado: {
      variant: "destructive" as const,
      text: "Atrasado",
      icon: "🔴",
    },
    quitado: {
      variant: "default" as const,
      text: "Quitado",
      icon: "✅",
    },
    pendente: {
      variant: "warning" as const,
      text: "Pendente",
      icon: "⏳",
    },
    cancelado: {
      variant: "secondary" as const,
      text: "Cancelado",
      icon: "❌",
    },
  };

  const config = statusConfig[status];

  return (
    <ModernBadge
      variant={config.variant}
      size={size}
      animated={animated}
      className="gap-1"
    >
      <span className="text-xs">{config.icon}</span>
      {config.text}
    </ModernBadge>
  );
};

interface PriorityBadgeProps {
  priority: "baixa" | "media" | "alta" | "urgente";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = "md",
  animated = true,
}) => {
  const priorityConfig = {
    baixa: {
      variant: "secondary" as const,
      text: "Baixa",
      icon: "🟢",
    },
    media: {
      variant: "info" as const,
      text: "Média",
      icon: "🟡",
    },
    alta: {
      variant: "warning" as const,
      text: "Alta",
      icon: "🟠",
    },
    urgente: {
      variant: "destructive" as const,
      text: "Urgente",
      icon: "🔴",
      pulse: true,
    },
  };

  const config = priorityConfig[priority];

  return (
    <ModernBadge
      variant={config.variant}
      size={size}
      animated={animated}
      pulse={('pulse' in config) ? config.pulse : false}
      className="gap-1"
    >
      <span className="text-xs">{config.icon}</span>
      {config.text}
    </ModernBadge>
  );
};
