/**
 * @file items.controller.spec.ts
 * @brief Unit tests for ItemsController with mocked ItemsService.
 * @details Uses NestJS Test.createTestingModule to build a minimal module where
 *          ItemsService is replaced by a mock provider. Tests verify that the controller
 *          delegates to the service and returns the correct status and body. No real
 *          database or service implementation is used. Demonstrates mocking a NestJS
 *          provider (service) in a controller test using jest.fn() for method stubs.
 * @author Victor Yeh
 * @date 2026-02-20
 * @copyright MIT License
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { Item } from './item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

/**
 * @brief Mock implementation of ItemsService for controller tests.
 * @details Each method is a jest.fn() so we can assert calls and control return values.
 *          This avoids using the real service and database. We use jest.fn() when we need
 *          a full substitute with no real implementation; jest.spyOn() is used when we
 *          want to spy on an existing object's method (e.g. in the same file or when
 *          we still use the real instance but track calls).
 */
const mockItemsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

/**
 * @brief Returns a full Item for controller tests (all fields present).
 */
function itemWith(overrides: Partial<Item> = {}): Item {
  const now: Date = new Date();
  return {
    id: 'uuid-1',
    name: 'Test',
    description: '',
    dateOfBirth: null,
    sex: '',
    phoneNumber: '',
    address: '',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('ItemsController', () => {
  /**
   * @var controller
   * @brief Instance of the controller under test.
   * @type ItemsController
   * @details Obtained from the testing module after overriding ItemsService with the mock.
   */
  let controller: ItemsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        {
          provide: ItemsService,
          useValue: mockItemsService,
        },
      ],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with body and return created item', async () => {
      const dto: CreateItemDto = { name: 'Test Item', description: 'Desc' };
      const saved: Item = itemWith({
        name: dto.name,
        description: dto.description ?? '',
      });
      mockItemsService.create.mockResolvedValue(saved);

      const result: Item = await controller.create(dto);

      expect(mockItemsService.create).toHaveBeenCalledTimes(1);
      expect(mockItemsService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(saved);
      expect(result.id).toBe('uuid-1');
    });

    it('should pass full DTO including dateOfBirth, sex, phoneNumber, address to service', async () => {
      const dto: CreateItemDto = {
        name: 'Jane',
        description: 'D',
        dateOfBirth: '1995-06-10',
        sex: 'female',
        phoneNumber: '+44 20 7946 0958',
        address: '1 Victoria St, London',
      };
      const saved: Item = itemWith({
        ...dto,
        id: 'uuid-2',
        dateOfBirth: new Date('1995-06-10'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockItemsService.create.mockResolvedValue(saved);

      const result: Item = await controller.create(dto);

      expect(mockItemsService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(saved);
      expect(result.dateOfBirth).toEqual(new Date('1995-06-10'));
      expect(result.sex).toBe('female');
      expect(result.phoneNumber).toBe('+44 20 7946 0958');
      expect(result.address).toBe('1 Victoria St, London');
    });
  });

  describe('findAll', () => {
    it('should return array from service.findAll', async () => {
      const items: Item[] = [itemWith({ id: 'uuid-1', name: 'A' })];
      mockItemsService.findAll.mockResolvedValue(items);

      const result: Item[] = await controller.findAll();

      expect(mockItemsService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(items);
    });
  });

  describe('findOne', () => {
    it('should return item when service finds it', async () => {
      const item: Item = itemWith({ id: 'uuid-1', name: 'One' });
      mockItemsService.findOne.mockResolvedValue(item);

      const result: Item = await controller.findOne('uuid-1');

      expect(mockItemsService.findOne).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual(item);
    });

    it('should propagate NotFoundException when service throws', async () => {
      const validUuid = '11111111-1111-1111-1111-111111111111';
      mockItemsService.findOne.mockRejectedValue(
        new NotFoundException(`Item with id "${validUuid}" not found`),
      );

      await expect(controller.findOne(validUuid)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should propagate BadRequestException when id is not a valid UUID', async () => {
      mockItemsService.findOne.mockRejectedValue(
        new BadRequestException('Invalid UUID format'),
      );

      await expect(controller.findOne('not-a-uuid')).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.findOne('not-a-uuid')).rejects.toThrow(
        'Invalid UUID format',
      );
    });
  });

  describe('update', () => {
    it('should call service.update and return updated item', async () => {
      const dto: UpdateItemDto = { name: 'Updated' };
      const updated: Item = itemWith({
        id: 'uuid-1',
        name: 'Updated',
        description: 'old',
      });
      mockItemsService.update.mockResolvedValue(updated);

      const result: Item = await controller.update('uuid-1', dto);

      expect(mockItemsService.update).toHaveBeenCalledWith('uuid-1', dto);
      expect(result).toEqual(updated);
    });

    it('should call service.update with dateOfBirth, sex, phoneNumber, address', async () => {
      const dto: UpdateItemDto = {
        dateOfBirth: '2000-12-25',
        sex: 'other',
        phoneNumber: '07700900123',
        address: '2 High Street',
      };
      const updated: Item = itemWith({
        id: 'uuid-1',
        dateOfBirth: new Date('2000-12-25'),
        sex: dto.sex,
        phoneNumber: dto.phoneNumber,
        address: dto.address,
      });
      mockItemsService.update.mockResolvedValue(updated);

      const result: Item = await controller.update('uuid-1', dto);

      expect(mockItemsService.update).toHaveBeenCalledWith('uuid-1', dto);
      expect(result.dateOfBirth).toEqual(new Date('2000-12-25'));
      expect(result.sex).toBe('other');
      expect(result.phoneNumber).toBe('07700900123');
      expect(result.address).toBe('2 High Street');
    });

    it('should propagate BadRequestException when id is not a valid UUID', async () => {
      mockItemsService.update.mockRejectedValue(
        new BadRequestException('Invalid UUID format'),
      );
      const dto: UpdateItemDto = { name: 'X' };

      await expect(
        controller.update('invalid-id', dto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.update('invalid-id', dto),
      ).rejects.toThrow('Invalid UUID format');
    });
  });

  describe('remove', () => {
    it('should call service.remove and return removed item', async () => {
      const removed: Item = itemWith({ id: 'uuid-1', name: 'Gone' });
      mockItemsService.remove.mockResolvedValue(removed);

      const result: Item = await controller.remove('uuid-1');

      expect(mockItemsService.remove).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual(removed);
    });

    it('should propagate BadRequestException when id is not a valid UUID', async () => {
      mockItemsService.remove.mockRejectedValue(
        new BadRequestException('Invalid UUID format'),
      );

      await expect(controller.remove('not-a-uuid')).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.remove('not-a-uuid')).rejects.toThrow(
        'Invalid UUID format',
      );
    });
  });
});
