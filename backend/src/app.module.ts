import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Importar entidades
import { Usuario } from '../modules/usuarios/usuario.entity';
import { Tutor } from '../modules/tutores/tutor.entity';
import { Horario } from '../modules/horarios/horario.entity';
import { Clase } from '../modules/clases/clase.entity';
import { Asistencia } from '../modules/asistencias/asistencia.entity';
import { Reporte } from '../modules/reportes/reporte.entity';
import { Beneficiario } from '../modules/beneficiarios/beneficiario.entity';
import { Rol } from '../modules/roles/entities/rol.entity';
import { Permiso } from '../modules/roles/entities/permiso.entity';

// Importar módulos
import { AuthModule } from '../modules/auth/auth.module';
import { UsuariosModule } from '../modules/usuarios/usuarios.module';
import { TutoresModule } from '../modules/tutores/tutores.module';
import { HorariosModule } from '../modules/horarios/horarios.module';
import { BeneficiariosModule } from '../modules/beneficiarios/beneficiarios.module';
import { ClasesModule } from '../modules/clases/clases.module';
import { AsistenciasModule } from '../modules/asistencias/asistencias.module';
import { AyudasModule } from '../modules/ayudas/ayudas.module';
import { RolesModule } from '../modules/roles/roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [
          Usuario,
          Tutor,
          Horario,
          Beneficiario,
          Clase,
          Asistencia,
          Reporte,
          Rol,
          Permiso,
        ],
        synchronize: true,
        ssl: {
          rejectUnauthorized: false,
        },
        logging: configService.get('NODE_ENV') !== 'production',
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),

    // Módulos de la aplicación
    RolesModule, // Debe ir primero para que los permisos se creen
    AuthModule,
    UsuariosModule,
    TutoresModule,
    HorariosModule,
    BeneficiariosModule,
    ClasesModule,
    AsistenciasModule,
    AyudasModule,
  ],
})
export class AppModule {}
