import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from '../../usuarios/usuarios.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usuariosService: UsuariosService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'cdi-secret-key-2024'),
    });
  }

  async validate(payload: any) {
    // Cargar usuario con rol y permisos
    const usuario = await this.usuariosService.findOne(payload.sub);

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException();
    }

    // Retornar usuario con rol completo para el guard de permisos
    return {
      id: usuario.id,
      correo: usuario.correo,
      nombre: usuario.nombre,
      rol: usuario.rol,
      rol_id: usuario.rol_id,
    };
  }
}
