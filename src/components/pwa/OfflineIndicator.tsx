import { WifiOff, Wifi } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

export function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white py-2 px-4 flex items-center justify-center gap-2 z-50 text-sm font-medium">
      <WifiOff className="h-4 w-4" />
      <span>You're offline - Changes will sync when reconnected</span>
    </div>
  );
}

export function ConnectionStatus() {
  const { isOnline } = usePWA();

  return (
    <div className="flex items-center gap-2 text-sm">
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-action" />
          <span className="text-wolf-600">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-amber-500" />
          <span className="text-amber-600">Offline</span>
        </>
      )}
    </div>
  );
}
