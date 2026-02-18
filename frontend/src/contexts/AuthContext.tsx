'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { changePassword } from '@/lib/api/usuarios';
import { Usuario, LoginCredentials, RegisterData } from '@/lib/types';

interface AuthContextType {
  usuario: Usuario | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  primerLogin: boolean;
  login: (credentials: LoginCredentials, recordarme?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  cambiarPasswordPrimerLogin: (passwordActual: string, passwordNueva: string) => Promise<void>;
  tienePermiso: (permiso: string) => boolean;
  tieneAlgunPermiso: (permisos: string[]) => boolean;
  esSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [primerLogin, setPrimerLogin] = useState(false);
  const router = useRouter();

  // Verificar token al cargar — soporta localStorage y sessionStorage (Recordarme)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token =
          localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
          const { usuario } = await authApi.validateToken();
          setUsuario(usuario);
          setPrimerLogin(!!(usuario as any).primer_login);
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('usuario');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials, recordarme = false) => {
    try {
      const { access_token, usuario } = await authApi.login(credentials);

      // Si "Recordarme" está activo, guardar en localStorage (persiste al cerrar el navegador)
      // Si no, guardar en sessionStorage (se borra al cerrar la pestaña)
      const storage = recordarme ? localStorage : sessionStorage;
      storage.setItem('token', access_token);
      storage.setItem('usuario', JSON.stringify(usuario));

      setUsuario(usuario);
      setPrimerLogin(!!(usuario as any).primer_login);
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
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    setUsuario(null);
    setPrimerLogin(false);
    router.push('/');
  };

  // Cambiar contraseña en primer login — también limpia el flag
  const cambiarPasswordPrimerLogin = async (passwordActual: string, passwordNueva: string) => {
    if (!usuario) throw new Error('No hay usuario autenticado');
    await changePassword(usuario.id, passwordActual, passwordNueva);
    // Actualizar estado local para cerrar el modal
    setPrimerLogin(false);
    // Actualizar el objeto usuario en storage
    const updatedUsuario = { ...usuario, primer_login: false };
    const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
    storage.setItem('usuario', JSON.stringify(updatedUsuario));
    setUsuario(updatedUsuario as Usuario);
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
      if (esSuperAdmin()) return true;
      return usuario.permisos?.includes(permiso) === true;
    },
    [usuario, esSuperAdmin]
  );

  // Verificar si el usuario tiene al menos uno de los permisos
  const tieneAlgunPermiso = useCallback(
    (permisos: string[]): boolean => {
      if (!usuario) return false;
      if (esSuperAdmin()) return true;
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
        primerLogin,
        login,
        register,
        logout,
        cambiarPasswordPrimerLogin,
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
