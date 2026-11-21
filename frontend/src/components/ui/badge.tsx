import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'danger' | 'warning' | 'info';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-primary/10 text-primary',
    outline: 'border border-border text-foreground',
    danger: 'bg-critical/10 text-critical border border-critical/25',
    warning: 'bg-warning/10 text-warning border border-warning/25',
    info: 'bg-accent/10 text-accent border border-accent/25',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold leading-[1.5]',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
