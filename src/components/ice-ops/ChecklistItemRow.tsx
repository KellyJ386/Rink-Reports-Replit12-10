import { cn } from '../../lib/utils';
import type { ChecklistItemStatus } from '../../types';
import { Check, X, Minus } from 'lucide-react';

interface ChecklistItemRowProps {
  id: string;
  text: string;
  status: ChecklistItemStatus | null;
  onChange: (status: ChecklistItemStatus) => void;
  disabled?: boolean;
}

export function ChecklistItemRow({
  id,
  text,
  status,
  onChange,
  disabled = false,
}: ChecklistItemRowProps) {
  const buttons: { value: ChecklistItemStatus; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'pass', label: 'Pass', icon: <Check className="h-4 w-4" />, color: 'bg-action text-white' },
    { value: 'fail', label: 'Fail', icon: <X className="h-4 w-4" />, color: 'bg-red-500 text-white' },
    { value: 'na', label: 'N/A', icon: <Minus className="h-4 w-4" />, color: 'bg-wolf-400 text-white' },
  ];

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg border transition-colors',
        status === 'pass' && 'bg-action-50 border-action-200',
        status === 'fail' && 'bg-red-50 border-red-200',
        status === 'na' && 'bg-wolf-50 border-wolf-200',
        status === null && 'bg-white border-wolf-200'
      )}
    >
      <label htmlFor={id} className="flex-1 text-sm text-navy cursor-pointer">
        {text}
      </label>
      <div className="flex gap-1">
        {buttons.map((btn) => (
          <button
            key={btn.value}
            type="button"
            onClick={() => !disabled && onChange(btn.value)}
            disabled={disabled}
            className={cn(
              'p-2 rounded transition-all',
              status === btn.value ? btn.color : 'bg-wolf-100 text-wolf-500 hover:bg-wolf-200',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            title={btn.label}
          >
            {btn.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
