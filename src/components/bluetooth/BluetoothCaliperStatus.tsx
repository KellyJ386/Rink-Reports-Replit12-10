import { Bluetooth, BluetoothOff, Battery, RefreshCw, Loader2 } from 'lucide-react';
import { Button, Badge } from '../ui';
import { useBluetoothCaliper, useSimulatedCaliper } from '../../hooks/useBluetoothCaliper';

interface BluetoothCaliperStatusProps {
  onReading?: (value: number) => void;
  useSimulated?: boolean;
}

export function BluetoothCaliperStatus({ onReading, useSimulated = false }: BluetoothCaliperStatusProps) {
  // Use simulated caliper in development or when bluetooth not available
  const realCaliper = useBluetoothCaliper();
  const simulatedCaliper = useSimulatedCaliper();

  const caliper = useSimulated || !realCaliper.isSupported ? simulatedCaliper : realCaliper;

  const {
    isSupported,
    isConnecting,
    isConnected,
    deviceName,
    lastReading,
    batteryLevel,
    error,
    connect,
    disconnect,
    requestReading,
  } = caliper;

  // Notify parent of new readings
  if (lastReading !== null && onReading) {
    onReading(lastReading);
  }

  if (!isSupported && !useSimulated) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-wolf-100 rounded-lg">
        <BluetoothOff className="h-4 w-4 text-wolf-400" />
        <span className="text-sm text-wolf-600">Bluetooth not supported</span>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="p-4 bg-action-50 border border-action-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-action-100 rounded-lg">
              <Bluetooth className="h-5 w-5 text-action" />
            </div>
            <div>
              <p className="font-medium text-navy">{deviceName}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="ideal">Connected</Badge>
                {batteryLevel !== null && (
                  <span className="flex items-center gap-1 text-xs text-wolf-600">
                    <Battery className="h-3 w-3" />
                    {batteryLevel}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={requestReading}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Read
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={disconnect}
            >
              Disconnect
            </Button>
          </div>
        </div>

        {/* Current Reading */}
        {lastReading !== null && (
          <div className="mt-4 p-3 bg-white rounded-lg">
            <p className="text-xs text-wolf-500 uppercase tracking-wider">Current Reading</p>
            <p className="text-3xl font-bold text-navy mt-1">
              {lastReading.toFixed(1)} <span className="text-lg font-normal text-wolf-500">mm</span>
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 bg-wolf-50 border border-wolf-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-wolf-100 rounded-lg">
            <BluetoothOff className="h-5 w-5 text-wolf-400" />
          </div>
          <div>
            <p className="font-medium text-navy">Bluetooth Caliper</p>
            <p className="text-sm text-wolf-600">Connect your digital caliper</p>
          </div>
        </div>
        <Button
          onClick={connect}
          disabled={isConnecting}
          leftIcon={
            isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bluetooth className="h-4 w-4" />
            )
          }
        >
          {isConnecting ? 'Connecting...' : 'Connect'}
        </Button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-danger">{error}</p>
      )}

      {useSimulated && (
        <p className="mt-2 text-xs text-wolf-500">
          Using simulated caliper for demonstration
        </p>
      )}
    </div>
  );
}
