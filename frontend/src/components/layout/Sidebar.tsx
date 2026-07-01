'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { LogOut, UserCircle, Menu, X, ChevronDown } from 'lucide-react';
import { useSidebar } from '@/lib/hooks/useSidebar';
import type { MenuItem } from '@/lib/types';

export default function Sidebar() {
  const { isOpen, openMenus, usuario, logout, filterItems, toggleMenu, setIsOpen, menuGroups, adminGroup } = useSidebar();
  const pathname = usePathname();

  const renderMenuItem = (item: MenuItem, isSubItem = false) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isMenuOpen = openMenus[item.title];

    if (hasSubItems) {
      const filteredSubItems = filterItems(item.subItems);
      if (filteredSubItems.length === 0) return null;

      const isChildActive = filteredSubItems.some(
        (sub) => sub.href === pathname,
      );

      return (
        <div key={item.title} className="mb-1">
          <button
            onClick={() => toggleMenu(item.title)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all text-left group',
              isChildActive ? 'bg-blue-50' : 'hover:bg-gray-100/80',
            )}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={cn(
                "p-2 rounded-lg transition-colors shadow-sm",
                isChildActive ? "bg-blue-600 text-white" : "bg-white text-gray-500 border border-gray-200 group-hover:border-gray-300"
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={cn(
                  'font-bold text-[13px] tracking-wide truncate',
                  isChildActive ? 'text-blue-900' : 'text-gray-700',
                )}
              >
                {item.title}
              </span>
            </div>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-gray-400 transition-transform duration-200',
                isMenuOpen ? 'rotate-180' : '',
              )}
            />
          </button>

          <div
            className={cn(
              'overflow-hidden transition-all duration-300 ease-in-out',
              isMenuOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0',
            )}
          >
            <div className="pl-4 pr-2 py-1 space-y-1 relative before:absolute before:left-6 before:top-0 before:bottom-0 before:w-[2px] before:bg-gray-100 before:rounded-full ml-5">
              {filteredSubItems.map((subItem) => {
                const isSubActive = pathname === subItem.href;
                return (
                <Link
                  key={subItem.href}
                  href={subItem.href || '#'}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all relative group',
                    isSubActive
                      ? 'bg-white shadow-sm border border-gray-100'
                      : 'hover:bg-white/60',
                  )}
                >
                  <div className={cn("absolute -left-3 w-2 h-2 rounded-full transition-colors", isSubActive ? "bg-blue-600" : "bg-transparent group-hover:bg-gray-300")} />
                  <subItem.icon className={cn("w-4 h-4", isSubActive ? "text-blue-600" : "text-gray-400")} />
                  <span className={cn("text-[13px] font-semibold", isSubActive ? "text-gray-900" : "text-gray-500 group-hover:text-gray-900")}>
                    {subItem.title}
                  </span>
                </Link>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (!filterItems([item]).length) return null;

    return (
      <Link
        key={item.href || item.title}
        href={item.href || '#'}
        onClick={() => setIsOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-3 rounded-xl transition-all group mb-1',
          isActive
            ? 'bg-blue-600 shadow-md shadow-blue-200'
            : 'hover:bg-gray-100/80',
        )}
      >
        <div className={cn(
          "p-2 rounded-lg transition-colors shadow-sm",
          isActive ? "bg-white/20 text-white" : "bg-white text-gray-500 border border-gray-200 group-hover:border-gray-300"
        )}>
          <Icon className={cn('w-4 h-4')} />
        </div>
        <span className={cn("font-bold text-[13px] tracking-wide", isActive ? "text-white" : "text-gray-700")}>{item.title}</span>
      </Link>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen transition-transform bg-[#f8fafc] border-r border-gray-200 flex flex-col',
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
          'lg:translate-x-0 w-[280px]',
        )}
      >
        <div className="p-6 border-b border-gray-200 shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 cursor-pointer"
          >
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
              <p className="text-xs text-gray-500">Gestión de Programa</p>
            </div>
          </Link>
        </div>

        <div className="p-4 border-b border-gray-200 shrink-0">
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

        <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {menuGroups.map((group) => renderMenuItem(group))}

          {filterItems(adminGroup.subItems).length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Sistema
              </p>
              {renderMenuItem(adminGroup)}
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200 shrink-0">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
