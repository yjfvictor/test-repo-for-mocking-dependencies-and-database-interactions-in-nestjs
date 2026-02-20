/**
 * @file items.service.spec.ts
 * @brief Unit tests for ItemsService with mocked TypeORM Repository.
 * @details Uses NestJS Test.createTestingModule and getRepositoryToken(Item) to provide
 *          a mock Repository<Item>. The mock implements create, save, find, findOne,
 *          and remove with jest.fn() so that no real database is used. Tests verify
 *          service logic (e.g. NotFoundException when findOne returns null). Demonstrates
 *          mocking a database repository in a service test.
 * @author Victor Yeh
 * @date 2026-02-20
 * @copyright MIT License
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { Item } from './item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

/**
 * @brief Mock TypeORM Repository methods used by ItemsService.
 * @details create and save are used in create() and update(); find in findAll();
 *          findOne in findOne(), update(), remove(); remove in remove(). We use jest.fn()
 *          to fully replace the repository so that no database connection is required.
 */
const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
};

/**
 * @const VALID_UUID
 * @brief A valid UUID string for use in service calls (findOne, update, remove).
 * @details The service validates id format; tests must pass valid UUIDs to avoid BadRequestException.
 */
const VALID_UUID = '11111111-1111-1111-1111-111111111111';

/**
 * @fn fullItem
 * @brief Returns an Item with all fields set (for use in tests).
 * @type function
 * @param overrides - { Partial<Item> } Optional overrides for the default Item.
 * @returns { Item } A complete Item instance.
 */
function fullItem(overrides: Partial<Item> = {}): Item {
  const now: Date = new Date();
  return {
    id: VALID_UUID,
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

describe('ItemsService', () => {
  /**
   * @var service
   * @brief Instance of the service under test.
   * @type ItemsService
   */
  let service: ItemsService;

  /**
   * @var repository
   * @brief Reference to the mock repository for configuring return values in tests.
   * @type Repository<Item>
   */
  let repository: Repository<Item>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        {
          provide: getRepositoryToken(Item),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
    repository = module.get<Repository<Item>>(getRepositoryToken(Item));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save an item', async () => {
      const dto: CreateItemDto = { name: 'New', description: 'Desc' };
      const created: Item = fullItem({
        name: dto.name,
        description: dto.description ?? '',
      });
      mockRepository.create.mockReturnValue(created);
      mockRepository.save.mockResolvedValue(created);

      const result: Item = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith({
        name: dto.name,
        description: dto.description ?? '',
        dateOfBirth: null,
        sex: '',
        phoneNumber: '',
        address: '',
      });
      expect(repository.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });

    it('should create item with dateOfBirth, sex, phoneNumber, and address', async () => {
      const dto: CreateItemDto = {
        name: 'Full',
        description: 'D',
        dateOfBirth: '1990-05-15',
        sex: 'male',
        phoneNumber: '+44 20 7123 4567',
        address: '10 Downing Street, London',
      };
      const created: Item = fullItem({
        name: dto.name,
        description: dto.description ?? '',
        dateOfBirth: new Date('1990-05-15'),
        sex: dto.sex ?? '',
        phoneNumber: dto.phoneNumber ?? '',
        address: dto.address ?? '',
      });
      mockRepository.create.mockReturnValue(created);
      mockRepository.save.mockResolvedValue(created);

      const result: Item = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith({
        name: dto.name,
        description: dto.description ?? '',
        dateOfBirth: new Date('1990-05-15'),
        sex: dto.sex,
        phoneNumber: dto.phoneNumber,
        address: dto.address,
      });
      expect(result.dateOfBirth).toEqual(new Date('1990-05-15'));
      expect(result.sex).toBe('male');
      expect(result.phoneNumber).toBe('+44 20 7123 4567');
      expect(result.address).toBe('10 Downing Street, London');
    });

    it('should throw BadRequestException when name is undefined', async () => {
      const dto = { description: 'Only description' } as CreateItemDto;

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'name is required and must be a non-empty string',
      );
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when name is empty string', async () => {
      const dto: CreateItemDto = { name: '', description: 'Desc' };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'name is required and must be a non-empty string',
      );
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when name is only whitespace', async () => {
      const dto: CreateItemDto = { name: '   \t\n  ' };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'name is required and must be a non-empty string',
      );
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when name is not a string', async () => {
      const dto = { name: 123 } as unknown as CreateItemDto;

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'name is required and must be a non-empty string',
      );
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should trim name and create item when name has leading and trailing spaces', async () => {
      const dto: CreateItemDto = { name: '  Trimmed Name  ', description: 'Desc' };
      const created: Item = fullItem({
        name: 'Trimmed Name',
        description: dto.description ?? '',
      });
      mockRepository.create.mockReturnValue(created);
      mockRepository.save.mockResolvedValue(created);

      const result: Item = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith({
        name: 'Trimmed Name',
        description: dto.description ?? '',
        dateOfBirth: null,
        sex: '',
        phoneNumber: '',
        address: '',
      });
      expect(repository.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });

    it('should throw BadRequestException when dateOfBirth is provided but invalid', async () => {
      const dto: CreateItemDto = {
        name: 'Test',
        dateOfBirth: 'not-a-date',
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'Invalid date of birth; use ISO date format (YYYY-MM-DD).',
      );
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when dateOfBirth is unparseable string', async () => {
      const dto: CreateItemDto = {
        name: 'Test',
        dateOfBirth: '31/12/1999',
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'Invalid date of birth; use ISO date format (YYYY-MM-DD).',
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when dateOfBirth is invalid calendar date', async () => {
      const dto: CreateItemDto = {
        name: 'Test',
        dateOfBirth: '1989-11-31',
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'Invalid date of birth; use ISO date format (YYYY-MM-DD).',
      );
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when dateOfBirth is Feb 30', async () => {
      const dto: CreateItemDto = {
        name: 'Test',
        dateOfBirth: '2025-02-30',
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'Invalid date of birth; use ISO date format (YYYY-MM-DD).',
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all items from repository.find', async () => {
      const items: Item[] = [fullItem({ id: VALID_UUID, name: 'A' })];
      mockRepository.find.mockResolvedValue(items);

      const result: Item[] = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({ order: { createdAt: 'ASC' } });
      expect(result).toEqual(items);
    });
  });

  describe('findOne', () => {
    it('should return item when found', async () => {
      const item: Item = fullItem({ id: VALID_UUID, name: 'One' });
      mockRepository.findOne.mockResolvedValue(item);

      const result: Item = await service.findOne(VALID_UUID);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: VALID_UUID },
      });
      expect(result).toEqual(item);
    });

    it('should throw NotFoundException when item does not exist', async () => {
      const nonExistentUuid = '00000000-0000-0000-0000-000000000000';
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(nonExistentUuid)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(nonExistentUuid)).rejects.toThrow(
        `Item with id "${nonExistentUuid}" not found`,
      );
    });

    it('should throw BadRequestException when id is not a valid UUID', async () => {
      await expect(service.findOne('not-a-uuid')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findOne('not-a-uuid')).rejects.toThrow(
        'Invalid UUID format',
      );
      expect(repository.findOne).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for empty string id', async () => {
      await expect(service.findOne('')).rejects.toThrow(BadRequestException);
      expect(repository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and save when item exists', async () => {
      const existing: Item = fullItem({
        id: VALID_UUID,
        name: 'Old',
        description: 'Desc',
      });
      const dto: UpdateItemDto = { name: 'New Name' };
      mockRepository.findOne.mockResolvedValue(existing);
      mockRepository.save.mockImplementation((entity: Item): Promise<Item> => {
        return Promise.resolve({ ...entity });
      });

      const result: Item = await service.update(VALID_UUID, dto);

      expect(existing.name).toBe('New Name');
      expect(repository.save).toHaveBeenCalledWith(existing);
      expect(result.name).toBe('New Name');
    });

    it('should update dateOfBirth, sex, phoneNumber, and address when provided', async () => {
      const existing: Item = fullItem({
        id: VALID_UUID,
        name: 'Old',
        dateOfBirth: null,
        sex: '',
        phoneNumber: '',
        address: '',
      });
      const dto: UpdateItemDto = {
        dateOfBirth: '1985-01-20',
        sex: 'female',
        phoneNumber: '+61 3 1234 5678',
        address: '123 Main St, Melbourne',
      };
      mockRepository.findOne.mockResolvedValue(existing);
      mockRepository.save.mockImplementation((entity: Item): Promise<Item> => {
        return Promise.resolve({ ...entity });
      });

      const result: Item = await service.update(VALID_UUID, dto);

      expect(existing.dateOfBirth).toEqual(new Date('1985-01-20'));
      expect(existing.sex).toBe('female');
      expect(existing.phoneNumber).toBe('+61 3 1234 5678');
      expect(existing.address).toBe('123 Main St, Melbourne');
      expect(result.dateOfBirth).toEqual(new Date('1985-01-20'));
      expect(result.sex).toBe('female');
    });

    it('should throw NotFoundException when item does not exist', async () => {
      const nonExistentUuid = '00000000-0000-0000-0000-000000000000';
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(nonExistentUuid, { name: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when id is not a valid UUID', async () => {
      await expect(
        service.update('invalid-id', { name: 'X' }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update('invalid-id', { name: 'X' }),
      ).rejects.toThrow('Invalid UUID format');
      expect(repository.findOne).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when dateOfBirth is provided but invalid', async () => {
      const existing: Item = fullItem({ id: VALID_UUID, name: 'Old' });
      mockRepository.findOne.mockResolvedValue(existing);

      await expect(
        service.update(VALID_UUID, { dateOfBirth: 'not-a-date' }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(VALID_UUID, { dateOfBirth: 'not-a-date' }),
      ).rejects.toThrow(
        'Invalid date of birth; use ISO date format (YYYY-MM-DD).',
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when dateOfBirth is unparseable string', async () => {
      const existing: Item = fullItem({ id: VALID_UUID, name: 'Old' });
      mockRepository.findOne.mockResolvedValue(existing);

      await expect(
        service.update(VALID_UUID, { dateOfBirth: '31/12/1999' }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(VALID_UUID, { dateOfBirth: '31/12/1999' }),
      ).rejects.toThrow(
        'Invalid date of birth; use ISO date format (YYYY-MM-DD).',
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when dateOfBirth is invalid calendar date', async () => {
      const existing: Item = fullItem({ id: VALID_UUID, name: 'Old' });
      mockRepository.findOne.mockResolvedValue(existing);

      await expect(
        service.update(VALID_UUID, { dateOfBirth: '1989-11-31' }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(VALID_UUID, { dateOfBirth: '1989-11-31' }),
      ).rejects.toThrow(
        'Invalid date of birth; use ISO date format (YYYY-MM-DD).',
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when dateOfBirth is Feb 30', async () => {
      const existing: Item = fullItem({ id: VALID_UUID, name: 'Old' });
      mockRepository.findOne.mockResolvedValue(existing);

      await expect(
        service.update(VALID_UUID, { dateOfBirth: '2025-02-30' }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(VALID_UUID, { dateOfBirth: '2025-02-30' }),
      ).rejects.toThrow(
        'Invalid date of birth; use ISO date format (YYYY-MM-DD).',
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove item when it exists', async () => {
      const item: Item = fullItem({ id: VALID_UUID, name: 'Gone' });
      mockRepository.findOne.mockResolvedValue(item);
      mockRepository.remove.mockResolvedValue(item);

      const result: Item = await service.remove(VALID_UUID);

      expect(repository.remove).toHaveBeenCalledWith(item);
      expect(result).toEqual(item);
    });

    it('should throw NotFoundException when item does not exist', async () => {
      const nonExistentUuid = '00000000-0000-0000-0000-000000000000';
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(nonExistentUuid)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when id is not a valid UUID', async () => {
      await expect(service.remove('not-a-uuid')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.remove('not-a-uuid')).rejects.toThrow(
        'Invalid UUID format',
      );
      expect(repository.findOne).not.toHaveBeenCalled();
    });
  });
});
