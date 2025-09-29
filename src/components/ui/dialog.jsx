import React from "react";
import { cn } from "../../lib/utils";
import { FiX } from "react-icons/fi";

const Dialog = ({ open, onOpenChange, children, className, ...props }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "relative z-50 w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

const DialogHeader = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
};

const DialogTitle = ({ className, ...props }) => {
  return (
    <h2
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
};

const DialogDescription = ({ className, ...props }) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
};

const DialogContent = ({ className, children, ...props }) => {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {children}
    </div>
  );
};

const DialogFooter = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    />
  );
};

const DialogClose = ({ className, children, ...props }) => {
  return (
    <button
      className={cn(
        "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
        className
      )}
      onClick={() => props.onClick?.()}
      {...props}
    >
      {children || <FiX className="h-4 w-4" />}
    </button>
  );
};

export {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
  DialogClose,
};
