import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex w-full rounded-lg border border-stone-700/60 bg-stone-950/70 px-4 py-3 text-base text-stone-100 placeholder:text-stone-500 shadow-inner backdrop-blur transition-colors focus-visible:border-ember/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/30 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
