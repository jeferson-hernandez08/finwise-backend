import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Origenes permitidos: el del .env mas los dos locales de Angular.
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:4200';
  const allowedOrigins = Array.from(
    new Set([frontendUrl, 'http://localhost:4200', 'http://127.0.0.1:4200']),
  );

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      // Sin transform, los DTO con @Type(() => Date) + @IsDate() reciben un
      // string y siempre responden 400 (pagos de deuda, aportes, deadline).
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  // Sin prefijo global: el frontend llama a http://localhost:3000/expenses.
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  Logger.log(`FinWise API escuchando en http://localhost:${port}`, 'Bootstrap');
  Logger.log(`CORS habilitado para: ${allowedOrigins.join(', ')}`, 'Bootstrap');
}
bootstrap();
