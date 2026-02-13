import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from './entities/rol.entity';
import { Permiso } from './entities/permiso.entity';
import { RolesService } from './roles.service';
import { PermisosService } from './permisos.service';
import { RolesController } from './roles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Rol, Permiso])],
  controllers: [RolesController],
  providers: [RolesService, PermisosService],
  exports: [RolesService, PermisosService, TypeOrmModule],
})
export class RolesModule {}
