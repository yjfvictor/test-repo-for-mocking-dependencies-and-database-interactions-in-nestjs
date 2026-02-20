/**
 * @file items.module.ts
 * @brief NestJS feature module for the items resource.
 * @details Registers Item entity with TypeORM, provides ItemsService and ItemsController,
 *          and exports ItemsService for use in other modules if needed.
 * @author Victor Yeh
 * @date 2026-02-20
 * @copyright MIT License
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './item.entity';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';

/**
 * @class ItemsModule
 * @brief Module that aggregates item entity, service, and controller.
 * @type class
 * @details TypeOrmModule.forFeature([Item]) registers the repository that ItemsService injects.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Item])],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [ItemsService],
})
export class ItemsModule {}
