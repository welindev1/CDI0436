import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import { DataSource } from 'typeorm';

// Custom exception filter and validation pipe
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Run migrations on startup (only in production)
  if (configService.get('NODE_ENV') === 'production') {
    const logger = new Logger('Migration');
    try {
      const dataSource = app.get(DataSource);
      logger.log('Running pending migrations...');
      const migrations = await dataSource.runMigrations();
      if (migrations.length === 0) {
        logger.log('No pending migrations.');
      } else {
        logger.log(`${migrations.length} migration(s) executed successfully.`);
      }
    } catch (error) {
      logger.error('Failed to run migrations:', error);
    }
  }

  // Aumentar limite para fotos en base64 (10MB)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Servir archivos estáticos desde la carpeta uploads
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://app.tbccaminando.org', // Dominio de producción
    ...(frontendUrl ? [frontendUrl] : []),
  ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // ========================================
  // Global Exception Filter
  // ========================================
  app.useGlobalFilters(new HttpExceptionFilter());

  // ========================================
  // Global Validation Pipe (custom)
  // ========================================
  app.useGlobalPipes(new ValidationPipe());

  // ========================================
  // Security Headers (helmet-like, manual)
  // ========================================
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('CDI')
    .setDescription('The cdi API description')
    .setVersion('1.0')
    .addTag('cdi')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('apidocs', app, documentFactory);

  app.use((req, res, next) => {
    if (req.path === '/beneficiarios/importar') {
      req.setTimeout(60000);
    }
    next();
  });

  await app.listen(configService.get('PORT') || 3001);
}
bootstrap();
