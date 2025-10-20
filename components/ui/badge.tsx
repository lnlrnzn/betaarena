import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "secondary" | "success" | "destructive" | "outline";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center px-3 py-1 text-xs font-semibold border-2",
          {
            "bg-card text-card-foreground border-border": variant === "default",
            "bg-primary text-primary-foreground border-border": variant === "primary",
            "bg-secondary text-secondary-foreground border-border": variant === "secondary",
            "bg-accent text-accent-foreground border-border": variant === "success",
            "bg-destructive text-destructive-foreground border-border": variant === "destructive",
            "bg-transparent text-foreground border-border": variant === "outline",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
