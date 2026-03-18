import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  children: ReactNode;
  className?: string;
  onClose?: () => void;
}

export default function Alert({ variant = 'info', children, className, onClose }: AlertProps) {
  const variants = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const Icon = icons[variant];

  return (
    <div className={cn('flex items-start gap-3 p-4 border rounded-lg', variants[variant], className)}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}