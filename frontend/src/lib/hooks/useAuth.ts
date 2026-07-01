import { useQuery, useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import type { LoginCredentials, RegisterData } from '@/lib/types';

// Query key factory
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
  validate: () => [...authKeys.all, 'validate'] as const,
};

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
  });
}

export function useValidateToken() {
  return useQuery({
    queryKey: authKeys.validate(),
    queryFn: () => authApi.validateToken(),
    retry: false,
  });
}
