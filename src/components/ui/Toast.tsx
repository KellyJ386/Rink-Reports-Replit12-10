import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onDismiss: (id: string) => void;
}

const typeStyles = {
  success: {
    container: 'bg-action-50 border-action',
    icon: CheckCircle,
    iconColor: 'text-action',
  },
  error: {
    container: 'bg-red-50 border-danger',
    icon: AlertCircle,
    iconColor: 'text-danger',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-500',
    icon: AlertTriangle,
    iconColor: 'text-yellow-600',
  },
  info: {
    container: 'bg-blue-50 border-blue-500',
    icon: Info,
    iconColor: 'text-blue-600',
  },
};

export function Toast({ id, type, title, message, duration = 5000, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { container, icon: Icon, iconColor } = typeStyles[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(id), 200);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onDismiss]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg transition-all duration-200',
        container,
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      )}
      role="alert"
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColor)} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-navy">{title}</p>
        {message && <p className="text-sm text-wolf-600 mt-1">{message}</p>}
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onDismiss(id), 200);
        }}
        className="flex-shrink-0 p-1 rounded hover:bg-wolf-200 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4 text-wolf-500" />
      </button>
    </div>
  );
}

export interface ToastContainerProps {
  toasts: Array<Omit<ToastProps, 'onDismiss'>>;
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
