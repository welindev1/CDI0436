import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Importar entidades
import { Usuario } from 'modules/usuarios/usuario.entity';
import { Tutor } from 'modules/tutores/tutor.entity';
import { Horario } from 'modules/horarios/horario.entity';
import { Clase } from 'modules/clases/clase.entity';
import { Asistencia } from 'modules/asistencias/asistencia.entity';
import { Reporte } from 'modules/reportes/reporte.entity';
import { Beneficiario } from 'modules/beneficiarios/beneficiario.entity';

// Importar módulos
import { AuthModule } from 'modules/auth/auth.module';
import { UsuariosModule } from 'modules/usuarios/usuarios.module';
import { TutoresModule } from 'modules/tutores/tutores.module';
import { HorariosModule } from 'modules/horarios/horarios.module';
import { BeneficiariosModule } from 'modules/beneficiarios/beneficiarios.module';
import { ClasesModule } from 'modules/clases/clases.module';
import { AsistenciasModule } from 'modules/asistencias/asistencias.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USER', 'cdi'),
        password: configService.get('DATABASE_PASSWORD', 'cdi123'),
        database: configService.get('DATABASE_NAME', 'cdi_db'),
        entities: [
          Usuario,
          Tutor,
          Horario,
          Beneficiario,
          Clase,
          Asistencia,
          Reporte,
        ],
        synchronize: true,
        logging: true,
      }),
      inject: [ConfigService],
    }),

    // Módulos de la aplicación
    AuthModule,
    UsuariosModule,
    TutoresModule,
    HorariosModule,
    BeneficiariosModule,
    ClasesModule,
    AsistenciasModule,
  ],
})
export class AppModule {}
