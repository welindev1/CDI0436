import { EstadoAsistencia } from '@/lib/types';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface EstadoBadgeProps {
  estado: EstadoAsistencia;
  showIcon?: boolean;
}

export default function EstadoBadge({ estado, showIcon = true }: EstadoBadgeProps) {
  const configs = {
    [EstadoAsistencia.PRESENTE]: {
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
      label: 'Presente',
    },
    [EstadoAsistencia.AUSENTE]: {
      color: 'bg-red-100 text-red-800',
      icon: XCircle,
      label: 'Ausente',
    },
    [EstadoAsistencia.JUSTIFICADO]: {
      color: 'bg-blue-100 text-blue-800',
      icon: AlertCircle,
      label: 'Justificado',
    },
    [EstadoAsistencia.TARDE]: {
      color: 'bg-yellow-100 text-yellow-800',
      icon: Clock,
      label: 'Tarde',
    },
  };

  const config = configs[estado];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {showIcon && <Icon className="w-3 h-3" />}
      {config.label}
    </span>
  );
}