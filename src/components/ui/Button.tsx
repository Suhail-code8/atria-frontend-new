import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../utils/cn";

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-white hover:bg-primary-hover shadow-sm",
      secondary: "bg-secondary text-white hover:bg-secondary-hover shadow-sm",
      danger: "bg-danger text-white hover:opacity-90 shadow-sm",
      outline: "border border-secondary text-secondary hover:bg-secondary/10",
      ghost: "text-secondary hover:bg-secondary/10",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-12 px-8 text-base",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || (props as any).disabled}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          props.children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
