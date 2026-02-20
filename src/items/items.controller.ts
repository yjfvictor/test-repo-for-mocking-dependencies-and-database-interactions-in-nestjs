/**
 * @file items.controller.ts
 * @brief HTTP API for Item CRUD operations.
 * @details Exposes REST endpoints that delegate to ItemsService. In controller unit tests
 *          the service is mocked so that only controller behaviour (status codes, response
 *          shape, delegation) is verified without hitting the real service or database.
 * @author Victor Yeh
 * @date 2026-02-20
 * @copyright MIT License
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { Item } from './item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

/**
 * @class ItemsController
 * @brief REST controller for the items resource under /api/items.
 * @type class
 * @details Injects ItemsService; all handlers call the service and return its result.
 *          POST returns 201, DELETE returns 200, others return 200 with JSON body.
 */
@Controller('items')
export class ItemsController {
  /**
   * @brief Constructor injecting ItemsService.
   * @details In unit tests this dependency is replaced with a mock (e.g. jest.fn() or
   *          object with mocked methods) so that controller logic is tested in isolation.
   * @param itemsService - { ItemsService } Service that performs item CRUD operations.
   */
  constructor(private readonly itemsService: ItemsService) {}

  /**
   * @fn create
   * @brief Creates a new item.
   * @type function
   * @details Validates body as CreateItemDto, calls service.create, returns created item
   *          with HTTP 201.
   * @param body - { CreateItemDto } Incoming request body (name, optional description).
   * @returns { Promise<Item> } The created item.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateItemDto): Promise<Item> {
    return this.itemsService.create(body);
  }

  /**
   * @fn findAll
   * @brief Returns all items.
   * @type function
   * @details Calls service.findAll and returns the array as JSON with status 200.
   * @returns { Promise<Item[]> } All items.
   */
  @Get()
  async findAll(): Promise<Item[]> {
    return this.itemsService.findAll();
  }

  /**
   * @fn findOne
   * @brief Returns one item by id.
   * @type function
   * @details Calls service.findOne; if NotFoundException is thrown, NestJS returns 404.
   * @param id - { string } Path parameter: item UUID.
   * @returns { Promise<Item> } The item if found.
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Item> {
    return this.itemsService.findOne(id);
  }

  /**
   * @fn update
   * @brief Updates an item by id.
   * @type function
   * @details Calls service.update with id and body; NotFoundException yields 404.
   * @param id - { string } Path parameter: item UUID.
   * @param body - { UpdateItemDto } Partial update payload.
   * @returns { Promise<Item> } The updated item.
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateItemDto,
  ): Promise<Item> {
    return this.itemsService.update(id, body);
  }

  /**
   * @fn remove
   * @brief Deletes an item by id.
   * @type function
   * @details Calls service.remove; returns the removed item with status 200. NotFoundException yields 404.
   * @param id - { string } Path parameter: item UUID.
   * @returns { Promise<Item> } The removed item.
   */
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Item> {
    return this.itemsService.remove(id);
  }
}
