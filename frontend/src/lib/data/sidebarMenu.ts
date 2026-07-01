import { Home, Users, BookOpen, Clock, FileText, Settings, UserCircle, Shield, UserCog, UtensilsCrossed, Tent, BarChart3, Cake, HeartPulse, Award, Gift } from 'lucide-react';
import type { MenuItem } from '@/lib/types';

export const menuGroups: MenuItem[] = [
  {
    title: 'Inicio',
    icon: Home,
    href: '/dashboard',
  },
  {
    title: 'Gestión de Personas',
    icon: Users,
    subItems: [
      {
        title: 'Beneficiarios',
        icon: Users,
        href: '/dashboard/beneficiarios',
        permisos: ['beneficiarios:ver'],
      },
      {
        title: 'Tutores',
        icon: UserCircle,
        href: '/dashboard/tutores',
        permisos: ['tutores:ver'],
      },
      {
        title: 'Cumpleaños',
        icon: Cake,
        href: '/dashboard/cumpleanos',
        permisos: ['cumpleanos:ver'],
      },
    ],
  },
  {
    title: 'Académico y Operativa',
    icon: BookOpen,
    subItems: [
      {
        title: 'Clases',
        icon: BookOpen,
        href: '/dashboard/clases',
        permisos: ['clases:ver'],
      },
      {
        title: 'Horarios',
        icon: Clock,
        href: '/dashboard/horarios',
        permisos: ['horarios:ver'],
      },
      {
        title: 'Mérito Estudiantil',
        icon: Award,
        href: '/dashboard/merito',
        permisos: ['merito:ver'],
      },
    ],
  },
  {
    title: 'Bienestar Integral',
    icon: HeartPulse,
    subItems: [
      {
        title: 'Solicitudes de Ayuda',
        icon: FileText,
        href: '/dashboard/ayudas',
        permisos: ['ayudas:ver'],
      },
      {
        title: 'Supervivencia',
        icon: Tent,
        href: '/dashboard/supervivencia',
        permisos: ['supervivencia:ver'],
      },
      {
        title: 'Nutrición',
        icon: UtensilsCrossed,
        href: '/dashboard/nutricion',
        permisos: ['nutricion:ver'],
      },
    ],
  },
  {
    title: 'Análisis y Reportes',
    icon: BarChart3,
    subItems: [
      {
        title: 'Centro de Reportes',
        icon: FileText,
        href: '/dashboard/reportes',
        permisos: ['reportes:ver'],
      },
      {
        title: 'Reporte de Carpetas',
        icon: FileText,
        href: '/dashboard/reportes/carpetas',
        permisos: ['reportes:ver'],
      },
      {
        title: 'Bonos de Regalo',
        icon: Gift,
        href: '/dashboard/bonos',
        permisos: ['bonos:ver'],
      },
    ],
  },
];

export const adminGroup: MenuItem = {
  title: 'Administración',
  icon: Settings,
  subItems: [
    {
      title: 'Usuarios',
      icon: UserCog,
      href: '/dashboard/usuarios',
      permisos: ['usuarios:ver'],
    },
    {
      title: 'Roles y Permisos',
      icon: Shield,
      href: '/dashboard/roles',
      permisos: ['roles:ver'],
    },
  ],
};
