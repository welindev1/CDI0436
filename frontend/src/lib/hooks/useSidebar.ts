'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { menuGroups, adminGroup } from '@/lib/data/sidebarMenu';
import type { MenuItem } from '@/lib/types';

export function useSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const { usuario, logout, tieneAlgunPermiso, esSuperAdmin } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const newOpenMenus = { ...openMenus };
    let hasChanges = false;

    const checkActive = (group: MenuItem) => {
      if (group.subItems) {
        const isActive = group.subItems.some((sub) => sub.href === pathname);
        if (isActive && !newOpenMenus[group.title]) {
          newOpenMenus[group.title] = true;
          hasChanges = true;
        }
      }
    };

    menuGroups.forEach(checkActive);
    checkActive(adminGroup);

    if (hasChanges) {
      setOpenMenus(newOpenMenus);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const filterItems = (items?: MenuItem[]): MenuItem[] => {
    if (!items) return [];
    return items.filter((item) => {
      if (!item.permisos || item.permisos.length === 0) return true;
      if (esSuperAdmin()) return true;
      return tieneAlgunPermiso(item.permisos);
    });
  };

  return {
    isOpen,
    openMenus,
    usuario,
    logout,
    filterItems,
    toggleMenu,
    setIsOpen,
    menuGroups,
    adminGroup,
  };
}
