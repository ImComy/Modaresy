import React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(({ className, type = 'text', error, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        // Base styles
        'w-full h-10 sm:h-8 px-3 text-xs sm:text-sm rounded-lg border transition-all duration-200',
        'bg-input text-foreground placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'hover:scale-[1.01] focus:scale-[1.02] ring-offset-background',

        // Border + ring colors
        error
          ? 'border-destructive focus-visible:ring-destructive'
          : 'border-border/50 focus-visible:ring-primary',

        // Disabled state
        'disabled:opacity-50 disabled:cursor-not-allowed',

        className
      )}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
