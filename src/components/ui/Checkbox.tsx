import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <label
        htmlFor={checkboxId}
        className={cn('flex items-start gap-3 cursor-pointer', className)}
      >
        <div className="relative flex-shrink-0">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              'w-5 h-5 rounded border-2 transition-colors duration-200 flex items-center justify-center',
              'border-wolf-300 bg-white',
              'peer-checked:bg-navy peer-checked:border-navy',
              'peer-focus:ring-2 peer-focus:ring-navy-200 peer-focus:ring-offset-2'
            )}
          >
            <Check
              className={cn(
                'h-3.5 w-3.5 text-white opacity-0 transition-opacity duration-200',
                'peer-checked:opacity-100'
              )}
            />
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="text-sm font-medium text-navy">{label}</span>}
            {description && <span className="text-sm text-wolf-600">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
