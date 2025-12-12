'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardCheck,
  BookOpen,
  Clock,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  UserCircle,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    roles: ['administrador'],
  },
  {
    title: 'Beneficiarios',
    icon: Users,
    href: '/dashboard/beneficiarios',
    roles: ['administrador', 'profesor', 'tutor_lider', 'tutor'],
  },
  {
    title: 'Tutores',
    icon: UserCircle,
    href: '/dashboard/tutores',
    roles: ['administrador', 'profesor', 'tutor_lider'],
  },
  {
    title: 'Clases',
    icon: BookOpen,
    href: '/dashboard/clases',
    roles: ['administrador', 'profesor', 'tutor_lider', 'tutor'],
  },
  {
    title: 'Horarios',
    icon: Clock,
    href: '/dashboard/horarios',
    roles: ['administrador', 'profesor', 'tutor_lider', 'tutor'],
  },
  {
    title: 'Asistencias',
    icon: ClipboardCheck,
    href: '/dashboard/asistencias',
    roles: ['administrador', 'profesor', 'tutor_lider', 'tutor'],
  },
  {
    title: 'Reportes',
    icon: FileText,
    href: '/dashboard/reportes',
    roles: ['administrador', 'profesor', 'tutor_lider'],
  },
  {
    title: 'Configuración',
    icon: Settings,
    href: '/dashboard/configuracion',
    roles: ['administrador'],
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const { usuario, logout } = useAuth();
  const pathname = usePathname();

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(usuario?.rol || '')
  );

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
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
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
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CDI</span>
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
                <p className="text-xs text-gray-500 capitalize">{usuario?.rol?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {filteredMenuItems.map((item) => {
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
            })}
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