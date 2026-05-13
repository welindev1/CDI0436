'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Alert from '@/components/ui/Alert';

export default function LoginPage() {
  const { login, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    correo: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedCorreo = localStorage.getItem('cdi_correo');
    const savedPassword = localStorage.getItem('cdi_password');
    if (savedCorreo && savedPassword) {
      setFormData({
        correo: savedCorreo,
        password: atob(savedPassword),
      });
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem('cdi_correo', formData.correo);
        localStorage.setItem('cdi_password', btoa(formData.password));
      } else {
        localStorage.removeItem('cdi_correo');
        localStorage.removeItem('cdi_password');
      }
      await login(formData);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full font-sans bg-white">
      
      {/* Left Panel - Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center bg-white px-8 sm:px-12 lg:px-24 relative overflow-y-auto">
        <div className="w-full max-w-[400px] space-y-8 mt-10 lg:mt-0">
          
          {/* Header */}
          <div className="mb-10 text-center lg:text-left">
            <div className="mb-6 flex justify-center lg:justify-start">
              <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
                <img src="/logo.svg" alt="CDI Logo" className="h-10 w-auto" />
              </div>
            </div>
            <h2 className="text-[32px] font-extrabold text-gray-900 tracking-tight mb-2">
              Bienvenido de nuevo
            </h2>
            <p className="text-[15px] text-gray-500 font-medium">
              Ingresa tus credenciales para acceder al sistema CDI.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {error && (
              <Alert variant="error" className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm font-medium">
                {error}
              </Alert>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="correo"
                  autoComplete="email"
                  required
                  placeholder="ejemplo@cdi.com"
                  value={formData.correo}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 text-gray-900 placeholder-gray-400 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 text-gray-900 placeholder-gray-400 transition-all shadow-sm"
                />
              </div>

              <div className="flex items-center pt-2">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4.5 w-4.5 text-blue-600 focus:ring-blue-600 border-gray-300 rounded cursor-pointer transition-colors"
                />
                <label htmlFor="remember-me" className="ml-3 block text-[14px] text-gray-600 cursor-pointer select-none font-medium">
                  Recordar mis datos
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex justify-center items-center mt-2 active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Ingresar al Sistema'
                )}
              </button>
            </form>
          </div>
          
        </div>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden lg:block lg:w-[55%] relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://instagram.fsdq3-1.fna.fbcdn.net/v/t51.82787-15/528293548_18323296204235972_4814124760020746481_n.webp?_nc_cat=100&ig_cache_key=MzY5Mjg0OTI2MjM4Nzg4MzMwMw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=vhDOXHISam8Q7kNvwGiL0Hm&_nc_oc=AdqH663w4TfgKjfsQtKP7nOzjaqwVytubExhRlEW98XW-kOOq3kKNuDaTRZjwaXOYDRDf-CO_9RyeE0aloiuBk0K&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fsdq3-1.fna&_nc_gid=wjHFxIH83DuOJOV1o01dww&_nc_ss=7a22e&oh=00_Af7re-U2PSInV5Pfuvvt1gYvPlzRGIoApOejRZroPxixTA&oe=6A055B41')" }}
        />
        {/* Soft overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent mix-blend-multiply" />
      </div>

    </div>
  );
}
