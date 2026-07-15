import { cva } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050a18] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-white text-[#050a18] hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] hover:-translate-y-0.5",
        gradient:
          "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-[0_0_30px_rgba(129,140,248,0.3)] hover:shadow-[0_0_50px_rgba(129,140,248,0.5)] hover:-translate-y-0.5 hover:brightness-110",
        ghost:
          "text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10",
        outline:
          "border border-white/10 bg-transparent text-white hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-0.5",
        glow:
          "bg-white/[0.08] text-white border border-white/10 hover:bg-white/[0.12] hover:border-indigo-400/30 hover:shadow-[0_0_30px_rgba(129,140,248,0.2)]",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-8 text-base",
        xl: "h-14 px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export function Button({ className, variant, size, ...props }) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
