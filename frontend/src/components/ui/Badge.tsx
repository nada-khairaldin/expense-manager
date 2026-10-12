import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "neutral" | "primary" | "outline";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "neutral",
  size = "md",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    primary: "bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/30 dark:text-foreground border-brand-primary/20",
    success: "bg-status-success-bg text-status-success border-status-success/20",
    warning: "bg-status-warning-bg text-status-warning border-status-warning/20",
    danger: "bg-status-danger-bg text-status-danger border-status-danger/20",
    neutral: "bg-surface-muted text-text-secondary border-border",
    outline: "bg-transparent text-text-secondary border-border",
  };

  const dotColors = {
    primary: "bg-brand-primary",
    success: "bg-status-success",
    warning: "bg-status-warning",
    danger: "bg-status-danger",
    neutral: "bg-text-muted",
    outline: "bg-text-secondary",
  };

  const sizeStyles = {
    sm: "text-xs px-2 py-0.5 gap-1.5",
    md: "text-xs font-medium px-2.5 py-1 gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
