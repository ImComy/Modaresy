import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { cn } from '@/lib/utils';

// Basic Form wrapper
export function Form({ children, ...props }) {
  return (
    <form noValidate {...props} className={cn('space-y-6', props.className)}>
      {children}
    </form>
  );
}

// Wraps individual form fields (label + input + error)
export function FormItem({ children, className }) {
  return <div className={cn('space-y-1', className)}>{children}</div>;
}

export function FormLabel({ className, children }) {
  return <label className={cn('text-sm font-medium text-foreground', className)}>{children}</label>;
}

export function FormControl({ children }) {
  return <div>{children}</div>;
}

export function FormMessage({ children }) {
  return <p className="text-xs text-destructive mt-1">{children}</p>;
}

// Controller-based field abstraction
export function FormField({ name, control, render }) {
  return (
    <Controller
      name={name}
      control={control}
      render={(fieldProps) => render({ ...fieldProps })}
    />
  );
}
