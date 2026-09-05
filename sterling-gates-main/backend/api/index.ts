import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppModule } from '../src/app.module';

// Boot the Nest app lazily and cache the Express instance for the lifetime of
// each serverless warm container. Reusing the instance keeps the module graph
// and the Supabase client connection alive across requests (faster warm
// invocations, no per-request re-initialization).
let cachedHandler: ((req: Request, res: Response) => void) | null = null;

async function createHandler() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: (process.env.CORS_ORIGIN?.split(',').filter(Boolean) ?? true) as any,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
  return app.getHttpAdapter().getInstance() as (req: Request, res: Response) => void;
}

export default async function handler(req: Request, res: Response): Promise<void> {
  if (!cachedHandler) {
    cachedHandler = await createHandler();
  }
  cachedHandler(req, res);
}