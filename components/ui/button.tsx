import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost";
  size?: "default" | "lg" | "sm";
}

const base =
  "inline-flex items-center justify-center rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<string, string> = {
  default: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100"
};

const sizes: Record<string, string> = {
  default: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  sm: "h-8 px-3 text-xs"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />
  )
);
Button.displayName = "Button";
