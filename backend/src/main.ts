import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));


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
      // 10MB para archivos de importación
      req.setTimeout(60000); // 60 segundos timeout
    }
    next();
  });

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
