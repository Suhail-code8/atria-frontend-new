import * as React from "react";
import { cn } from "../../utils/cn";

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min = 0, max = 100, step = 1, ...props }, ref) => {
    return (
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        ref={ref}
        className={cn(
          "w-full h-2 bg-secondary/20 rounded-lg appearance-none cursor-pointer accent-primary",
          className
        )}
        {...props}
      />
    );
  }
);

Slider.displayName = "Slider";
