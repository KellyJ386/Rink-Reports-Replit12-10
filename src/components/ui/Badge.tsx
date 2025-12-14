import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import type { MeasurementStatus } from '../../types';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'ideal' | 'warning' | 'critical' | 'info';
}

const variantStyles = {
  default: 'bg-wolf-100 text-wolf-700',
  ideal: 'bg-action-100 text-action-700',
  warning: 'bg-yellow-100 text-yellow-800',
  critical: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Helper component for ice depth status
export interface IceDepthBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: MeasurementStatus;
}

export const IceDepthBadge = forwardRef<HTMLSpanElement, IceDepthBadgeProps>(
  ({ status, children, ...props }, ref) => {
    const variant = status === 'ideal' ? 'ideal' : status === 'warning' ? 'warning' : 'critical';
    const label = children || status.charAt(0).toUpperCase() + status.slice(1);

    return (
      <Badge ref={ref} variant={variant} {...props}>
        {label}
      </Badge>
    );
  }
);

IceDepthBadge.displayName = 'IceDepthBadge';
