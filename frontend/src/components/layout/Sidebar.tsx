'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils/cn';
import {
  Users,
  ClipboardCheck,
  BookOpen,
  Clock,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  UserCircle,
  Shield,
  UserCog,
  UtensilsCrossed,
  Tent,
  BarChart3,
  Cake,
} from 'lucide-react';

interface MenuItem {
  title: string;
  icon: any;
  href: string;
  permisos?: string[]; // Si está vacío, todos tienen acceso
}

const menuItems: MenuItem[] = [
  {
    title: 'Solicitudes de Ayuda',
    icon: FileText,
    href: '/dashboard/ayudas',
    permisos: ['ayudas:ver'],
  },
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
    title: 'Clases',
    icon: BookOpen,
    href: '/dashboard/clases',
    permisos: ['clases:ver'],
  },
  {
    title: 'Supervivencia',
    icon: Tent,
    href: '/dashboard/supervivencia',
    permisos: ['supervivencia:ver'],
  },
  {
    title: 'Horarios',
    icon: Clock,
    href: '/dashboard/horarios',
    permisos: ['horarios:ver'],
  },
  {
    title: 'Asistencias',
    icon: ClipboardCheck,
    href: '/dashboard/asistencias',
    permisos: ['asistencias:ver'],
  },
  {
    title: 'Nutrición',
    icon: UtensilsCrossed,
    href: '/dashboard/nutricion',
    permisos: ['nutricion:ver'],
  },
  {
    title: 'Reportes',
    icon: FileText,
    href: '/dashboard/reportes',
    permisos: ['reportes:ver'],
  },
  {
    title: 'Reportes Generales',
    icon: BarChart3,
    href: '/dashboard/reportes-generales',
    permisos: ['reportes_generales:ver'],
  },
  {
    title: 'Cumpleaños',
    icon: Cake,
    href: '/dashboard/cumpleanos',
    permisos: ['cumpleanos:ver'],
  },
];

const adminMenuItems: MenuItem[] = [
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
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { usuario, logout, tieneAlgunPermiso, esSuperAdmin } = useAuth();
  const pathname = usePathname();

  // Filtrar menú por permisos
  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.permisos || item.permisos.length === 0) return true;
    if (esSuperAdmin()) return true;
    return tieneAlgunPermiso(item.permisos);
  });

  // Filtrar menú admin
  const filteredAdminItems = adminMenuItems.filter((item) => {
    if (!item.permisos || item.permisos.length === 0) return true;
    if (esSuperAdmin()) return true;
    return tieneAlgunPermiso(item.permisos);
  });

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setIsOpen(false)}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
          isActive
            ? 'bg-blue-50 text-blue-600 font-medium'
            : 'text-gray-700 hover:bg-gray-50'
        )}
      >
        <Icon className="w-5 h-5" />
        <span>{item.title}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen transition-transform bg-white border-r border-gray-200',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 w-64'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <Image 
                  src="/logo.svg" 
                  alt="CDI Logo" 
                  width={48} 
                  height={48} 
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Sistema CDI</h1>
                <p className="text-xs text-gray-500">Gestión de Asistencia</p>
              </div>
            </div>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {usuario?.nombre}
                </p>
                <p className="text-xs text-gray-500">
                  {usuario?.rol?.nombre || 'Sin rol'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {filteredMenuItems.map(renderMenuItem)}

            {/* Sección de Administración */}
            {filteredAdminItems.length > 0 && (
              <>
                <div className="pt-4 pb-2">
                  <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Administración
                  </p>
                </div>
                {filteredAdminItems.map(renderMenuItem)}
              </>
            )}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
