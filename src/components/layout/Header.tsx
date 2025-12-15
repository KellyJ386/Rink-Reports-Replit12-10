import { Menu, Bell, Wifi, WifiOff, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-wolf-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side - Mobile menu button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Connection status indicator */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <span className="flex items-center gap-1.5 text-sm text-action">
                <Wifi className="h-4 w-4" />
                <span className="hidden sm:inline">Online</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm text-warning">
                <WifiOff className="h-4 w-4" />
                <span className="hidden sm:inline">Offline</span>
              </span>
            )}
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative" aria-label="Notifications, 3 unread">
            <Bell className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-danger text-white text-xs flex items-center justify-center" aria-hidden="true">
              3
            </span>
          </Button>

          {/* User menu */}
          <div className="flex items-center gap-3 pl-3 border-l border-wolf-200">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-navy">{user?.full_name || 'Guest'}</p>
              <p className="text-xs text-wolf-600 capitalize">
                {user?.role?.replace('_', ' ') || 'User'}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-full p-2" aria-label="User menu">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
