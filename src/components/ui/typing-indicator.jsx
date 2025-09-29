import React from "react";

const TypingIndicator = ({ message = "AI is thinking..." }) => {
  return (
    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
      <div className="flex space-x-1">
        <div
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
};

export default TypingIndicator;
