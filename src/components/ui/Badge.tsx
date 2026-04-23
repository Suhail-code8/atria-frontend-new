import * as React from "react";
import { cn } from "../../utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "danger" | "secondary" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-primary text-white",
    success: "bg-success/10 text-success border border-success/20",
    danger: "bg-danger/10 text-danger border border-danger/20",
    secondary: "bg-secondary/10 text-secondary border border-secondary/20",
    outline: "text-slate-900 border border-secondary/20",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
