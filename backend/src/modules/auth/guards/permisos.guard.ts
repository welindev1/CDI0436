import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISOS_KEY } from '../decorators/permisos.decorator';

@Injectable()
export class PermisosGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permisosRequeridos = this.reflector.getAllAndOverride<string[]>(
      PERMISOS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no hay permisos requeridos, permitir acceso
    if (!permisosRequeridos || permisosRequeridos.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Si no hay usuario, denegar acceso
    if (!user || !user.rol) {
      return false;
    }

    // Si es super admin, tiene todos los permisos
    if (user.rol.es_super_admin) {
      return true;
    }

    // Verificar si el usuario tiene alguno de los permisos requeridos
    const permisosUsuario = user.rol.permisos?.map((p: any) => p.codigo) || [];

    return permisosRequeridos.some((permiso) =>
      permisosUsuario.includes(permiso),
    );
  }
}
