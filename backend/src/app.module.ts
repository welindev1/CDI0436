import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

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
        username: configService.get('DATABASE_USER', 'postgres'),
        password: configService.get('DATABASE_PASSWORD', 'postgres123'),
        database: configService.get('DATABASE_NAME', 'miapp_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Solo en desarrollo
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
