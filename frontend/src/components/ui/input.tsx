import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, helperText, type = 'text', id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || props.name || generatedId;
    const messageId = `${inputId}-message`;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-foreground leading-[1.6]">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            'flex min-h-11 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground',
            'placeholder:text-muted-foreground/75 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            error && 'border-critical focus:ring-critical',
            className
          )}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error || helperText ? messageId : undefined}
          {...props}
        />
        {helperText && !error && (
          <p id={messageId} className="text-xs text-muted-foreground leading-relaxed">{helperText}</p>
        )}
        {error && (
          <p id={messageId} className="text-xs text-critical font-medium leading-relaxed" role="alert">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
