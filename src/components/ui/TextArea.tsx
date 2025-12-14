import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, helpText, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-navy mb-1">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-4 py-3 rounded-lg border-2 bg-white text-navy placeholder-wolf-500 font-body resize-y min-h-[100px]',
            'focus:outline-none focus:ring-2 transition-colors duration-200',
            error
              ? 'border-danger focus:border-danger focus:ring-red-200'
              : 'border-wolf-300 focus:border-navy focus:ring-navy-200',
            className
          )}
          {...props}
        />
        {helpText && !error && <p className="text-sm text-wolf-600 mt-1">{helpText}</p>}
        {error && <p className="text-sm text-danger mt-1">{error}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
