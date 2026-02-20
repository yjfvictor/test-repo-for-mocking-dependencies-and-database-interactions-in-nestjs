/**
 * @file main.ts
 * @brief Application entry point for the NestJS server.
 * @details Bootstraps the NestJS application, configures global prefix and port,
 *          and starts listening for HTTP requests. Loads database configuration
 *          from environment variables when available.
 * @author Victor Yeh
 * @date 2026-02-20
 * @copyright MIT License
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JsonParseExceptionFilter } from './common/filters/json-parse-exception.filter';
import { JsonContentTypeGuard } from './common/guards/json-content-type.guard';
import { validateJsonContentType } from './common/middleware/validate-json-content-type.middleware';

/**
 * @fn bootstrap
 * @brief Creates and starts the NestJS application.
 * @type function
 * @details Creates the NestJS application from AppModule, then registers middleware
 *          that validates Content-Type and charset before body parsing (so unsupported
 *          charset returns 400), sets global prefix 'api', global filter and guard,
 *          then listens on port 3000.
 * @returns { Promise<void> } Resolves when the server is listening.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.use(validateJsonContentType);
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new JsonParseExceptionFilter());
  app.useGlobalGuards(new JsonContentTypeGuard());
  const port: number = Number(process.env.PORT) || 3000;
  await app.listen(port);
}

bootstrap();
