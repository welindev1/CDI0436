'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { usuario } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-end px-4 sm:px-6 py-4 pl-16 lg:pl-6">
        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{usuario?.nombre}</p>
            <p className="text-xs text-gray-500">{usuario?.correo}</p>
          </div>
        </div>
      </div>
    </header>
  );
}