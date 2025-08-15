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
        "bg-gradient-to-r from-red-800 to-red-600 hover:from-red-900 hover:to-red-700",
        "text-white font-medium text-sm sm:text-base rounded-md",
        "transition-all duration-300 ease-in-out",
        inverse && "bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900",
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
