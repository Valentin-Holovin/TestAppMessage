import { cva } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva("pixel-button text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300", {
  variants: {
    variant: {
      default: "pixel-button-default",
      gradient: "pixel-button-primary",
      ghost: "pixel-button-ghost",
      outline: "pixel-button-outline",
      glow: "pixel-button-glow",
    },
    size: {
      default: "min-h-[44px] px-6",
      sm: "min-h-[38px] px-4 text-xs",
      lg: "min-h-[52px] px-8 text-base",
      xl: "min-h-[56px] px-10 text-base",
      icon: "h-11 w-11",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export function Button({ className, variant, size, ...props }) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
