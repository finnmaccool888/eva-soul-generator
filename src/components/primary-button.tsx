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
        "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
        "text-white font-medium text-sm sm:text-base rounded-md",
        "transition-all duration-300 ease-in-out",
        inverse && "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600",
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
