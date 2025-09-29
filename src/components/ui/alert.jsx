import React from "react";
import { cn } from "../../lib/utils";
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";

const Alert = ({ variant = "default", children, className, ...props }) => {
  const variants = {
    default: "bg-background text-foreground",
    destructive:
      "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
    success:
      "border-green-500/50 text-green-700 dark:border-green-500 dark:text-green-400 [&>svg]:text-green-600",
    warning:
      "border-yellow-500/50 text-yellow-700 dark:border-yellow-500 dark:text-yellow-400 [&>svg]:text-yellow-600",
  };

  return (
    <div
      className={cn(
        "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const AlertTitle = ({ className, ...props }) => {
  return (
    <h5
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  );
};

const AlertDescription = ({ className, ...props }) => {
  return (
    <div
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
};

export { Alert, AlertTitle, AlertDescription };
