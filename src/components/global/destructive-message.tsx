import { AlertTriangleIcon } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface DestructiveMessageProps {
  title?: string;
  description?: string;
  btn?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}
export default function DestructiveMessage({
  title = "Destructive Zone",
  description = "This is a destructive zone. Are you sure you want to perform this action?",
  btn = "Delete",
  onClick,
  className,
  children,
}: DestructiveMessageProps) {
  return (
    <div
      className={cn(
        "relative flex items-start gap-4 overflow-hidden rounded-lg border border-destructive/50 bg-destructive/5 p-4 shadow-sm transition-all hover:bg-destructive/10 mt-6",
        className
      )}
      role="alert"
      aria-live="assertive">
      <div className="flex-shrink-0">
        <AlertTriangleIcon
          className="size-6 text-destructive"
          aria-hidden="true"
        />
      </div>
      <div className="flex-1 space-y-3">
        <div className="space-y-1.5 text-sm">
          <h3 className="font-semibold text-destructive">{title}</h3>
          <p>{description}</p>
        </div>
        {children ? (
          children
        ) : (
          <Button variant="destructive" size="sm" onClick={onClick}>
            {btn}
          </Button>
        )}
      </div>
    </div>
  );
}
