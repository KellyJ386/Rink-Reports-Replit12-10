import { useState, useCallback, useRef, useEffect } from 'react';

// Web Bluetooth types - these extend the Navigator interface
interface BluetoothCaliperState {
  isSupported: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  deviceName: string | null;
  lastReading: number | null;
  batteryLevel: number | null;
  error: string | null;
}

interface BluetoothCaliperHook extends BluetoothCaliperState {
  connect: () => Promise<void>;
  disconnect: () => void;
  requestReading: () => void;
}

// Common Bluetooth GATT service UUIDs for digital calipers
const CALIPER_SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const CALIPER_CHARACTERISTIC_UUID = '0000fff1-0000-1000-8000-00805f9b34fb';
const BATTERY_SERVICE_UUID = 'battery_service';
const BATTERY_LEVEL_UUID = 'battery_level';

export function useBluetoothCaliper(): BluetoothCaliperHook {
  const [state, setState] = useState<BluetoothCaliperState>({
    isSupported: typeof navigator !== 'undefined' && 'bluetooth' in navigator,
    isConnecting: false,
    isConnected: false,
    deviceName: null,
    lastReading: null,
    batteryLevel: null,
    error: null,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deviceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const characteristicRef = useRef<any>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (deviceRef.current?.gatt?.connected) {
        deviceRef.current.gatt.disconnect();
      }
    };
  }, []);

  const handleDisconnected = useCallback(() => {
    setState(prev => ({
      ...prev,
      isConnected: false,
      deviceName: null,
      lastReading: null,
      batteryLevel: null,
    }));
    deviceRef.current = null;
    characteristicRef.current = null;
  }, []);

  const parseReading = (dataView: DataView): number => {
    // Parse reading from caliper - format varies by manufacturer
    // Most calipers send data as a series of bytes
    // Common formats:
    // - 6 bytes: sign (1), integer (4), decimal places indicator (1)
    // - Raw millimeter value as float

    // Try to parse as common format
    if (dataView.byteLength >= 4) {
      // Try reading as 32-bit float (little endian)
      const rawValue = dataView.getFloat32(0, true);
      if (!isNaN(rawValue) && rawValue > 0 && rawValue < 100) {
        return rawValue;
      }

      // Try reading as integer millimeters * 100
      const intValue = dataView.getInt32(0, true);
      if (intValue > 0 && intValue < 10000) {
        return intValue / 100;
      }
    }

    // Fallback: try reading individual bytes as digit sequence
    let value = 0;
    let decimal = 0;
    let negative = false;

    for (let i = 0; i < dataView.byteLength; i++) {
      const byte = dataView.getUint8(i);

      if (byte === 0x2D) {
        // '-' character
        negative = true;
      } else if (byte === 0x2E) {
        // '.' character
        decimal = 1;
      } else if (byte >= 0x30 && byte <= 0x39) {
        // Digit 0-9
        if (decimal > 0) {
          value += (byte - 0x30) / Math.pow(10, decimal);
          decimal++;
        } else {
          value = value * 10 + (byte - 0x30);
        }
      }
    }

    return negative ? -value : value;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleReading = useCallback((event: any) => {
    const characteristic = event.target;
    if (characteristic.value) {
      const reading = parseReading(characteristic.value);
      setState(prev => ({
        ...prev,
        lastReading: reading,
        error: null,
      }));
    }
  }, []);

  const connect = useCallback(async () => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'Bluetooth is not supported on this device',
      }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Request device with caliper services
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [CALIPER_SERVICE_UUID] },
          { namePrefix: 'Caliper' },
          { namePrefix: 'iGaging' },
          { namePrefix: 'Mitutoyo' },
          { namePrefix: 'Fowler' },
        ],
        optionalServices: [BATTERY_SERVICE_UUID],
      });

      deviceRef.current = device;
      device.addEventListener('gattserverdisconnected', handleDisconnected);

      // Connect to GATT server
      const server = await device.gatt?.connect();
      if (!server) throw new Error('Failed to connect to GATT server');

      // Get caliper service and characteristic
      try {
        const service = await server.getPrimaryService(CALIPER_SERVICE_UUID);
        const characteristic = await service.getCharacteristic(CALIPER_CHARACTERISTIC_UUID);

        characteristicRef.current = characteristic;

        // Subscribe to notifications
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handleReading);
      } catch (e) {
        console.warn('Could not connect to caliper service, trying generic approach');
      }

      // Try to get battery level
      try {
        const batteryService = await server.getPrimaryService(BATTERY_SERVICE_UUID);
        const batteryCharacteristic = await batteryService.getCharacteristic(BATTERY_LEVEL_UUID);
        const batteryValue = await batteryCharacteristic.readValue();
        const batteryLevel = batteryValue.getUint8(0);

        setState(prev => ({ ...prev, batteryLevel }));
      } catch (e) {
        // Battery service not available
        console.log('Battery service not available');
      }

      setState(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: true,
        deviceName: device.name || 'Unknown Caliper',
        error: null,
      }));
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to connect';
      setState(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: false,
        error: error.includes('cancelled') ? null : error,
      }));
    }
  }, [state.isSupported, handleDisconnected, handleReading]);

  const disconnect = useCallback(() => {
    if (deviceRef.current?.gatt?.connected) {
      if (characteristicRef.current) {
        characteristicRef.current.removeEventListener('characteristicvaluechanged', handleReading);
      }
      deviceRef.current.gatt.disconnect();
    }
    handleDisconnected();
  }, [handleDisconnected, handleReading]);

  const requestReading = useCallback(() => {
    if (characteristicRef.current) {
      // Some calipers require a read request instead of notifications
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      characteristicRef.current.readValue().then((value: any) => {
        const reading = parseReading(value);
        setState(prev => ({ ...prev, lastReading: reading }));
      }).catch(console.error);
    }
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    requestReading,
  };
}

// Simulated hook for development/testing
export function useSimulatedCaliper(): BluetoothCaliperHook {
  const [state, setState] = useState<BluetoothCaliperState>({
    isSupported: true,
    isConnecting: false,
    isConnected: false,
    deviceName: null,
    lastReading: null,
    batteryLevel: null,
    error: null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true }));

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    setState(prev => ({
      ...prev,
      isConnecting: false,
      isConnected: true,
      deviceName: 'Simulated Caliper',
      batteryLevel: 85,
    }));

    // Simulate periodic readings
    intervalRef.current = setInterval(() => {
      // Random depth between 25-45mm
      const reading = 25 + Math.random() * 20;
      setState(prev => ({
        ...prev,
        lastReading: Math.round(reading * 10) / 10,
      }));
    }, 2000);
  }, []);

  const disconnect = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState(prev => ({
      ...prev,
      isConnected: false,
      deviceName: null,
      lastReading: null,
      batteryLevel: null,
    }));
  }, []);

  const requestReading = useCallback(() => {
    const reading = 25 + Math.random() * 20;
    setState(prev => ({
      ...prev,
      lastReading: Math.round(reading * 10) / 10,
    }));
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    requestReading,
  };
}
