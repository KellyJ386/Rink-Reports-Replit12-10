import { useState, useCallback, useEffect, useRef } from 'react';

// Web Bluetooth API type declarations
declare global {
  interface Navigator {
    bluetooth: {
      requestDevice(options: {
        filters?: Array<{ services?: string[]; name?: string; namePrefix?: string }>;
        optionalServices?: string[];
        acceptAllDevices?: boolean;
      }): Promise<BluetoothDeviceWeb>;
    };
  }

  interface BluetoothDeviceWeb {
    id: string;
    name?: string;
    gatt?: BluetoothRemoteGATTServer;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  }

  interface BluetoothRemoteGATTServer {
    connected: boolean;
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
    getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
    getPrimaryServices(service?: string): Promise<BluetoothRemoteGATTService[]>;
  }

  interface BluetoothRemoteGATTService {
    uuid: string;
    getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristicWeb>;
    getCharacteristics(characteristic?: string): Promise<BluetoothRemoteGATTCharacteristicWeb[]>;
  }

  interface BluetoothRemoteGATTCharacteristicWeb {
    uuid: string;
    value?: DataView;
    properties: {
      read: boolean;
      write: boolean;
      notify: boolean;
      indicate: boolean;
    };
    readValue(): Promise<DataView>;
    writeValue(value: BufferSource): Promise<void>;
    startNotifications(): Promise<BluetoothRemoteGATTCharacteristicWeb>;
    stopNotifications(): Promise<BluetoothRemoteGATTCharacteristicWeb>;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  }
}

// Known Bluetooth digital caliper UUIDs
// Mitutoyo, Starrett, iGaging, and generic BLE calipers
const CALIPER_SERVICE_UUIDS = [
  '0000fff0-0000-1000-8000-00805f9b34fb', // Generic FFF0 service
  '0000ffe0-0000-1000-8000-00805f9b34fb', // Generic FFE0 service (common HM-10)
  '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART Service
];

const CALIPER_CHARACTERISTIC_UUIDS = [
  '0000fff1-0000-1000-8000-00805f9b34fb', // FFF1 notify
  '0000fff4-0000-1000-8000-00805f9b34fb', // FFF4 notify
  '0000ffe1-0000-1000-8000-00805f9b34fb', // FFE1 notify
  '6e400003-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART TX
];

interface UseBluetoothReturn {
  isSupported: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  deviceName: string | null;
  lastReading: number | null;
  calibrationOffset: number;
  error: string | null;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  setCalibrationOffset: (offset: number) => void;
  calibrate: (actualValue: number) => void;
}

/**
 * Hook for Web Bluetooth digital caliper integration
 * Supports common BLE digital calipers (Mitutoyo, Starrett, iGaging, etc.)
 */
export function useBluetooth(): UseBluetoothReturn {
  const [isSupported] = useState(() => typeof navigator !== 'undefined' && 'bluetooth' in navigator);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [lastReading, setLastReading] = useState<number | null>(null);
  const [calibrationOffset, setCalibrationOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const deviceRef = useRef<BluetoothDeviceWeb | null>(null);
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristicWeb | null>(null);

  // Parse caliper data from various formats
  const parseCalliperData = useCallback((dataView: DataView): number | null => {
    try {
      // Try different parsing strategies based on data length
      const length = dataView.byteLength;

      if (length >= 6) {
        // Mitutoyo/standard format: 6 bytes, value in last 4 bytes as float
        const value = dataView.getFloat32(2, true);
        if (!isNaN(value) && value >= 0 && value < 1000) {
          return value;
        }
      }

      if (length >= 4) {
        // Try 32-bit signed integer (value in 0.01mm or 0.001in)
        const rawValue = dataView.getInt32(0, true);
        const value = rawValue / 100; // Convert to mm
        if (!isNaN(value) && value >= 0 && value < 1000) {
          return value;
        }
      }

      if (length >= 2) {
        // Try 16-bit value (value in 0.01mm)
        const rawValue = dataView.getInt16(0, true);
        const value = rawValue / 100;
        if (!isNaN(value) && value >= 0 && value < 1000) {
          return value;
        }
      }

      // Try parsing as ASCII string (some calipers send text)
      const decoder = new TextDecoder();
      const text = decoder.decode(dataView.buffer);
      const match = text.match(/[-+]?\d+\.?\d*/);
      if (match) {
        const value = parseFloat(match[0]);
        if (!isNaN(value) && value >= 0 && value < 1000) {
          return value;
        }
      }

      return null;
    } catch {
      return null;
    }
  }, []);

  // Handle characteristic value change
  const handleCharacteristicValueChanged = useCallback((event: Event) => {
    const characteristic = event.target as unknown as BluetoothRemoteGATTCharacteristicWeb;
    const dataView = characteristic?.value;

    if (dataView) {
      const reading = parseCalliperData(dataView);
      if (reading !== null) {
        // Apply calibration offset
        const calibratedReading = reading + calibrationOffset;
        setLastReading(calibratedReading);
        setError(null);
      }
    }
  }, [parseCalliperData, calibrationOffset]);

  // Connect to a Bluetooth caliper
  const connect = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Bluetooth is not supported on this device');
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request device with caliper service filters
      const device = await navigator.bluetooth.requestDevice({
        filters: CALIPER_SERVICE_UUIDS.map(uuid => ({ services: [uuid] })),
        optionalServices: CALIPER_SERVICE_UUIDS,
      });

      if (!device.gatt) {
        throw new Error('GATT not available on device');
      }

      // Connect to GATT server
      const server = await device.gatt.connect();

      // Find the appropriate service and characteristic
      let characteristic: BluetoothRemoteGATTCharacteristicWeb | null = null;

      for (const serviceUuid of CALIPER_SERVICE_UUIDS) {
        try {
          const service = await server.getPrimaryService(serviceUuid);

          for (const charUuid of CALIPER_CHARACTERISTIC_UUIDS) {
            try {
              const char = await service.getCharacteristic(charUuid);
              if (char.properties.notify) {
                characteristic = char;
                break;
              }
            } catch {
              // Try next characteristic
            }
          }

          if (characteristic) break;
        } catch {
          // Try next service
        }
      }

      if (!characteristic) {
        throw new Error('No compatible notification characteristic found');
      }

      // Start notifications
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);

      // Store references
      deviceRef.current = device;
      characteristicRef.current = characteristic;

      // Handle disconnection
      device.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
        setDeviceName(null);
        deviceRef.current = null;
        characteristicRef.current = null;
      });

      setDeviceName(device.name || 'Unknown Device');
      setIsConnected(true);
      setIsConnecting(false);

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect';
      // Don't show error if user cancelled
      if (!message.includes('cancelled')) {
        setError(message);
      }
      setIsConnecting(false);
      return false;
    }
  }, [isSupported, handleCharacteristicValueChanged]);

  // Disconnect from device
  const disconnect = useCallback(() => {
    if (characteristicRef.current) {
      try {
        characteristicRef.current.removeEventListener(
          'characteristicvaluechanged',
          handleCharacteristicValueChanged
        );
        characteristicRef.current.stopNotifications();
      } catch {
        // Ignore errors during cleanup
      }
    }

    if (deviceRef.current?.gatt) {
      try {
        deviceRef.current.gatt.disconnect();
      } catch {
        // Ignore errors during cleanup
      }
    }

    deviceRef.current = null;
    characteristicRef.current = null;
    setIsConnected(false);
    setDeviceName(null);
    setLastReading(null);
    setError(null);
  }, [handleCharacteristicValueChanged]);

  // Calibrate the caliper
  const calibrate = useCallback((actualValue: number) => {
    if (lastReading !== null) {
      const rawReading = lastReading - calibrationOffset; // Get uncalibrated reading
      const newOffset = actualValue - rawReading;
      setCalibrationOffset(newOffset);
    }
  }, [lastReading, calibrationOffset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isSupported,
    isConnected,
    isConnecting,
    deviceName,
    lastReading,
    calibrationOffset,
    error,
    connect,
    disconnect,
    setCalibrationOffset,
    calibrate,
  };
}

/**
 * Check if Web Bluetooth is available
 */
export function isBluetoothAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}
