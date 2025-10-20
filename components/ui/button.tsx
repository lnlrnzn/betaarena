import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all",
          "border-2 disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-primary text-primary-foreground border-border hover:shadow-md":
              variant === "primary",
            "bg-secondary text-secondary-foreground border-border hover:shadow-md":
              variant === "secondary",
            "bg-destructive text-destructive-foreground border-border hover:shadow-md":
              variant === "destructive",
            "bg-transparent border-border hover:bg-accent hover:text-accent-foreground":
              variant === "outline",
            "bg-transparent border-transparent hover:bg-accent hover:text-accent-foreground":
              variant === "ghost",
          },
          {
            "px-3 py-1.5 text-sm shadow-xs": size === "sm",
            "px-6 py-3 text-base shadow-sm": size === "md",
            "px-8 py-4 text-lg shadow-md": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
