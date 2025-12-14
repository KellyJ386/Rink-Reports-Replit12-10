import { useCallback } from 'react';
import { cn } from '../../lib/utils';

interface PercentageGaugeProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color?: 'blue' | 'brown' | 'green' | 'yellow';
  icon?: React.ReactNode;
  showPercentage?: boolean;
  disabled?: boolean;
  className?: string;
}

const colorClasses = {
  blue: {
    fill: 'bg-blue-500',
    track: 'bg-blue-100',
    text: 'text-blue-700',
  },
  brown: {
    fill: 'bg-amber-700',
    track: 'bg-amber-100',
    text: 'text-amber-800',
  },
  green: {
    fill: 'bg-action',
    track: 'bg-action-100',
    text: 'text-action-700',
  },
  yellow: {
    fill: 'bg-yellow-500',
    track: 'bg-yellow-100',
    text: 'text-yellow-700',
  },
};

export function PercentageGauge({
  label,
  value,
  onChange,
  color = 'blue',
  icon,
  showPercentage = true,
  disabled = false,
  className,
}: PercentageGaugeProps) {
  const colors = colorClasses[color];

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseInt(e.target.value, 10));
    },
    [onChange]
  );

  const handleQuickSet = useCallback(
    (val: number) => {
      if (!disabled) {
        onChange(val);
      }
    },
    [onChange, disabled]
  );

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-navy">
          {icon}
          {label}
        </label>
        {showPercentage && (
          <span className={cn('text-lg font-bold', colors.text)}>{value}%</span>
        )}
      </div>

      {/* Visual gauge */}
      <div className={cn('relative h-8 rounded-lg overflow-hidden', colors.track)}>
        <div
          className={cn('absolute inset-y-0 left-0 transition-all duration-200', colors.fill)}
          style={{ width: `${value}%` }}
        />
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={value}
          onChange={handleSliderChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
      </div>

      {/* Quick set buttons */}
      <div className="flex gap-1">
        {[0, 25, 50, 75, 100].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => handleQuickSet(val)}
            disabled={disabled}
            className={cn(
              'flex-1 py-1 text-xs font-medium rounded transition-colors',
              value === val
                ? `${colors.fill} text-white`
                : 'bg-wolf-100 text-wolf-600 hover:bg-wolf-200',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {val}%
          </button>
        ))}
      </div>
    </div>
  );
}
