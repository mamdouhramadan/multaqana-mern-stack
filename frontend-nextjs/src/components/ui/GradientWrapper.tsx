import { cn } from "@/utils/utils";
import React from "react";

interface GradientWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  rounded?: boolean;
}

export const GradientWrapper = ({ className, rounded = false, children, ...props }: GradientWrapperProps) => {
  return (
    <div
      className={cn(
        "relative z-10 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden text-white",
        rounded && "rounded-xl",
        className
      )}
      {...props}
    >
      {/* Content with z-index to stay above background elements */}
      <>
        {children}
      </>

      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
    </div>
  );
};
