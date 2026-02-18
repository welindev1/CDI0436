'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { Usuario, LoginCredentials, RegisterData } from '@/lib/types';

interface AuthContextType {
  usuario: Usuario | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  tienePermiso: (permiso: string) => boolean;
  tieneAlgunPermiso: (permisos: string[]) => boolean;
  esSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Verificar token al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const { usuario } = await authApi.validateToken();
          setUsuario(usuario);
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const { access_token, usuario } = await authApi.login(credentials);
      localStorage.setItem('token', access_token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      setUsuario(usuario);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error detailed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const { access_token, usuario } = await authApi.register(data);
      localStorage.setItem('token', access_token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      setUsuario(usuario);
      router.push('/dashboard');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al registrarse');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    router.push('/');
  };

  // Verificar si el usuario es super admin
  const esSuperAdmin = useCallback((): boolean => {
    if (!usuario) return false;
    return usuario.rol?.es_super_admin === true || usuario.permisos?.includes('*') === true;
  }, [usuario]);

  // Verificar si el usuario tiene un permiso específico
  const tienePermiso = useCallback(
    (permiso: string): boolean => {
      if (!usuario) return false;

      // Super admin tiene todos los permisos
      if (esSuperAdmin()) return true;

      // Verificar en la lista de permisos
      return usuario.permisos?.includes(permiso) === true;
    },
    [usuario, esSuperAdmin]
  );

  // Verificar si el usuario tiene al menos uno de los permisos
  const tieneAlgunPermiso = useCallback(
    (permisos: string[]): boolean => {
      if (!usuario) return false;

      // Super admin tiene todos los permisos
      if (esSuperAdmin()) return true;

      // Verificar si tiene al menos uno
      return permisos.some((permiso) => usuario.permisos?.includes(permiso));
    },
    [usuario, esSuperAdmin]
  );

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isLoading,
        isAuthenticated: !!usuario,
        login,
        register,
        logout,
        tienePermiso,
        tieneAlgunPermiso,
        esSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
