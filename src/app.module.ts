/**
 * @file app.module.ts
 * @brief Root application module for the NestJS application.
 * @details Imports TypeORM with PostgreSQL configuration and feature modules (ItemsModule).
 *          Database connection uses environment variables with sensible defaults for local Docker.
 * @author Victor Yeh
 * @date 2026-02-20
 * @copyright MIT License
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsModule } from './items/items.module';

/**
 * @class AppModule
 * @brief Root module that aggregates all application modules and database configuration.
 * @type class
 * @details Single root module that imports TypeOrmModule.forRoot for PostgreSQL and
 *          ItemsModule for CRUD functionality. TypeORM entities are auto-loaded from
 *          the entities path.
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST ?? 'localhost',
      port: Number(process.env.DATABASE_PORT) ?? 5432,
      username: process.env.DATABASE_USER ?? 'nestjs_user',
      password: process.env.DATABASE_PASSWORD ?? 'nestjs_password',
      database: process.env.DATABASE_NAME ?? 'nestjs_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ItemsModule,
  ],
})
export class AppModule {}
