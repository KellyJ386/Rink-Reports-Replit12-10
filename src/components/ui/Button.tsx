import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantStyles = {
  primary:
    'bg-navy text-white hover:bg-navy-600 focus:ring-2 focus:ring-navy-400 focus:ring-offset-2',
  secondary:
    'bg-wolf-100 text-navy hover:bg-wolf-200 focus:ring-2 focus:ring-wolf-400 focus:ring-offset-2',
  success:
    'bg-action text-white hover:bg-action-600 focus:ring-2 focus:ring-action-400 focus:ring-offset-2',
  danger:
    'bg-danger text-white hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:ring-offset-2',
  ghost:
    'bg-transparent text-navy hover:bg-wolf-100 focus:ring-2 focus:ring-wolf-400 focus:ring-offset-2',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  md: 'px-4 py-2 text-base min-h-touch',
  lg: 'px-6 py-3 text-lg min-h-[56px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-display font-medium',
          'transition-colors duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !isLoading && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
