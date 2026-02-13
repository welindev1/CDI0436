'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/ui/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[]; // Mantener por compatibilidad
  requiredPermiso?: string; // Nuevo: permiso requerido
  requiredPermisos?: string[]; // Nuevo: cualquiera de estos permisos
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPermiso,
  requiredPermisos,
}: ProtectedRouteProps) {
  const { usuario, isLoading, isAuthenticated, tienePermiso, tieneAlgunPermiso, esSuperAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Loading />;
  }

  // Verificar permisos (nuevo sistema)
  if (requiredPermiso) {
    if (!tienePermiso(requiredPermiso)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
            <p className="text-gray-600">No tienes permisos para acceder a esta página</p>
          </div>
        </div>
      );
    }
  }

  if (requiredPermisos && requiredPermisos.length > 0) {
    if (!tieneAlgunPermiso(requiredPermisos)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
            <p className="text-gray-600">No tienes permisos para acceder a esta página</p>
          </div>
        </div>
      );
    }
  }

  // Compatibilidad con sistema viejo de roles (si se usa)
  // Super admin siempre tiene acceso
  if (requiredRole && !esSuperAdmin()) {
    const rolNombre = usuario?.rol?.nombre?.toLowerCase() || '';
    const tieneRol = requiredRole.some(r =>
      rolNombre.includes(r.toLowerCase().replace('_', ' ')) ||
      rolNombre.includes(r.toLowerCase())
    );

    if (!tieneRol) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
            <p className="text-gray-600">No tienes permisos para acceder a esta página</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
