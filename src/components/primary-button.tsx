import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { ComponentProps } from "react";

export default function PrimaryButton({
  children,
  size = "default",
  inverse,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "lg";
  inverse?: boolean;
} & ComponentProps<"button">) {
  return (
    <Button
      className={cn(
        "h-[36px] sm:h-[40px] px-4 sm:px-6 cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]",
        "bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-900 hover:to-slate-800",
        "text-white font-medium text-sm sm:text-base rounded-md",
        "transition-all duration-300 ease-in-out",
        inverse && "bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900",
        size === "lg" && "h-[40px] sm:h-[48px] px-6 sm:px-8 text-base sm:text-lg",
        className
      )}
      inverse={inverse}
      {...props}
    >
      {children}
    </Button>
  );
}
