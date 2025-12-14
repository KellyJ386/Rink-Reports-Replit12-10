import { cn } from '../../lib/utils';
import type { CutType } from '../../types';
import { Droplets, Wind } from 'lucide-react';

interface CutTypeToggleProps {
  value: CutType;
  onChange: (value: CutType) => void;
  disabled?: boolean;
  className?: string;
}

export function CutTypeToggle({
  value,
  onChange,
  disabled = false,
  className,
}: CutTypeToggleProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-navy">Cut Type</label>
      <div className="flex rounded-lg overflow-hidden border border-wolf-300">
        <button
          type="button"
          onClick={() => !disabled && onChange('wet')}
          disabled={disabled}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-colors',
            value === 'wet'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-wolf-600 hover:bg-wolf-50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Droplets className="h-5 w-5" />
          <span className="font-medium">Wet</span>
        </button>
        <button
          type="button"
          onClick={() => !disabled && onChange('dry')}
          disabled={disabled}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-colors border-l border-wolf-300',
            value === 'dry'
              ? 'bg-amber-500 text-white'
              : 'bg-white text-wolf-600 hover:bg-wolf-50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Wind className="h-5 w-5" />
          <span className="font-medium">Dry</span>
        </button>
      </div>
      <p className="text-xs text-wolf-500">
        {value === 'wet' ? 'Standard resurfacing with water' : 'Snow removal only, no water'}
      </p>
    </div>
  );
}
