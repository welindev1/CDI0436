import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const usuario = await this.usuariosService.validateUser(
      loginDto.correo,
      loginDto.password,
    );

    if (!usuario) {
      this.logger.warn(
        `Intento de login fallido para correo: ${loginDto.correo}`,
      );
      throw new UnauthorizedException('Credenciales inválidas');
    }

    this.logger.log(`Usuario logueado exitosamente: ${usuario.correo}`);

    // Extraer códigos de permisos
    const permisos =
      usuario.rol?.permisos?.map((p) => p.codigo) || [];

    const payload = {
      sub: usuario.id,
      correo: usuario.correo,
      nombre: usuario.nombre,
      rol_id: usuario.rol_id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
          ? {
              id: usuario.rol.id,
              nombre: usuario.rol.nombre,
              es_super_admin: usuario.rol.es_super_admin,
            }
          : null,
        permisos: usuario.rol?.es_super_admin ? ['*'] : permisos,
      },
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const usuario = await this.usuariosService.findOne(payload.sub);

      if (!usuario || !usuario.activo) {
        throw new UnauthorizedException();
      }

      const permisos =
        usuario.rol?.permisos?.map((p) => p.codigo) || [];

      return {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
          ? {
              id: usuario.rol.id,
              nombre: usuario.rol.nombre,
              es_super_admin: usuario.rol.es_super_admin,
            }
          : null,
        permisos: usuario.rol?.es_super_admin ? ['*'] : permisos,
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
