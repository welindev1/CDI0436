import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: any) {
    // Extraer permisos del rol
    const permisos = user.rol?.permisos?.map((p: any) => p.codigo) || [];

    return {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol
        ? {
            id: user.rol.id,
            nombre: user.rol.nombre,
            es_super_admin: user.rol.es_super_admin,
          }
        : null,
      permisos: user.rol?.es_super_admin ? ['*'] : permisos,
    };
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  validateToken(@CurrentUser() user: any) {
    // Extraer permisos del rol
    const permisos = user.rol?.permisos?.map((p: any) => p.codigo) || [];

    return {
      valid: true,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol
          ? {
              id: user.rol.id,
              nombre: user.rol.nombre,
              es_super_admin: user.rol.es_super_admin,
            }
          : null,
        permisos: user.rol?.es_super_admin ? ['*'] : permisos,
      },
    };
  }
}
