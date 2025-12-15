import { useState, useEffect, useRef } from 'react';
import { Modal, ModalFooter, Button, Input, Toggle } from '../ui';
import { type MeasurementPoint } from './rink-templates';
import { formatDepth, getIceDepthStatus, mmToInches, inchesToMm } from '../../lib/utils';
import { IceDepthBadge } from '../ui/Badge';

interface MeasurementEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  point: MeasurementPoint | null;
  currentValue?: number;
  onSave: (pointId: string, value: number) => void;
  unit: 'mm' | 'in';
  onUnitChange: (unit: 'mm' | 'in') => void;
  bluetoothValue?: number | null;
  isBluetoothConnected: boolean;
}

export function MeasurementEntryModal({
  isOpen,
  onClose,
  point,
  currentValue,
  onSave,
  unit,
  onUnitChange,
  bluetoothValue,
  isBluetoothConnected,
}: MeasurementEntryModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [useBluetoothValue, setUseBluetoothValue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input when point changes or bluetooth value arrives
  useEffect(() => {
    if (point && isOpen) {
      if (currentValue !== undefined) {
        const displayValue = unit === 'mm' ? currentValue : mmToInches(currentValue);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional initialization when modal opens
        setInputValue(displayValue.toFixed(unit === 'mm' ? 1 : 2));
      } else {
        setInputValue('');
      }
      setUseBluetoothValue(false);

      // Focus input after modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [point, currentValue, isOpen, unit]);

  // Auto-populate bluetooth value when it changes
  useEffect(() => {
    if (bluetoothValue !== null && bluetoothValue !== undefined && isBluetoothConnected && useBluetoothValue) {
      const displayValue = unit === 'mm' ? bluetoothValue : mmToInches(bluetoothValue);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional sync from bluetooth device
      setInputValue(displayValue.toFixed(unit === 'mm' ? 1 : 2));
    }
  }, [bluetoothValue, isBluetoothConnected, useBluetoothValue, unit]);

  const handleSave = () => {
    if (!point || !inputValue) return;

    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) return;

    // Convert to mm if using inches
    const valueInMm = unit === 'mm' ? numValue : inchesToMm(numValue);
    onSave(point.id, valueInMm);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const numericValue = parseFloat(inputValue);
  const valueInMm = !isNaN(numericValue) ? (unit === 'mm' ? numericValue : inchesToMm(numericValue)) : null;
  const status = valueInMm !== null ? getIceDepthStatus(valueInMm) : null;

  if (!point) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Measurement Point ${point.order}`}
      size="sm"
    >
      <div className="space-y-4">
        {/* Point info */}
        <div className="p-3 bg-wolf-50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-wolf-600">Zone</span>
            <span className="font-medium text-navy capitalize">
              {point.zone.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Unit toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-wolf-600">Unit</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onUnitChange('mm')}
              className={`px-3 py-1 text-sm rounded ${
                unit === 'mm'
                  ? 'bg-navy text-white'
                  : 'bg-wolf-100 text-navy hover:bg-wolf-200'
              }`}
            >
              mm
            </button>
            <button
              type="button"
              onClick={() => onUnitChange('in')}
              className={`px-3 py-1 text-sm rounded ${
                unit === 'in'
                  ? 'bg-navy text-white'
                  : 'bg-wolf-100 text-navy hover:bg-wolf-200'
              }`}
            >
              inches
            </button>
          </div>
        </div>

        {/* Bluetooth auto-fill toggle */}
        {isBluetoothConnected && (
          <Toggle
            label="Use Bluetooth Caliper"
            description="Auto-fill from connected device"
            checked={useBluetoothValue}
            onChange={(e) => setUseBluetoothValue(e.target.checked)}
          />
        )}

        {/* Measurement input */}
        <div>
          <Input
            ref={inputRef}
            label={`Ice Depth (${unit})`}
            type="number"
            step={unit === 'mm' ? '0.1' : '0.01'}
            min="0"
            max={unit === 'mm' ? '100' : '4'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Enter depth in ${unit}`}
          />

          {/* Status preview */}
          {status && valueInMm !== null && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-wolf-600">Status</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-navy">
                  {formatDepth(valueInMm, 'mm')}
                </span>
                <IceDepthBadge status={status} />
              </div>
            </div>
          )}
        </div>

        {/* Ideal range info */}
        <div className="text-xs text-wolf-500 text-center">
          Ideal range: {formatDepth(25.4, unit)} – {formatDepth(44.45, unit)}
        </div>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!inputValue || isNaN(parseFloat(inputValue))}>
          Save Measurement
        </Button>
      </ModalFooter>
    </Modal>
  );
}
