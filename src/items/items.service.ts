/**
 * @file items.service.ts
 * @brief Business logic and data access for Item resources.
 * @details Delegates persistence to TypeORM Repository<Item>. Provides create, findAll,
 *          findOne, update, and remove. Used by ItemsController; in tests the repository
 *          is mocked so that no real database is required.
 * @author Victor Yeh
 * @date 2026-02-20
 * @copyright MIT License
 */

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

/**
 * @const UUID_REGEX
 * @brief Regular expression matching RFC 4122 UUID format (8-4-4-4-12 hex digits).
 * @details Used to validate id path parameters before querying the database so that
 *          invalid ids yield 400 Bad Request instead of 500 from the driver/database.
 */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * @fn isValidUuid
 * @brief Returns whether a string is a valid UUID.
 * @type function
 * @param value - { string } Candidate id from the client.
 * @returns { boolean } True if value matches UUID format.
 */
function isValidUuid(value: string): boolean {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

/**
 * @const INVALID_DATE_OF_BIRTH_MESSAGE
 * @brief Error message returned to the client when dateOfBirth is provided but invalid.
 */
const INVALID_DATE_OF_BIRTH_MESSAGE =
  'Invalid date of birth; use ISO date format (YYYY-MM-DD).';

/**
 * @fn parseDateOfBirth
 * @brief Parses an ISO date string (YYYY-MM-DD) to a Date or null.
 * @type function
 * @details Returns null if the value is missing, empty, or invalid.
 * @param value - { string | undefined } Raw value from the DTO.
 * @returns { Date | null } Parsed date or null.
 */
function parseDateOfBirth(value: string | undefined): Date | null {
  if (value === undefined || typeof value !== 'string' || value.trim() === '') {
    return null;
  }
  const parsed: number = Date.parse(value.trim());
  return Number.isNaN(parsed) ? null : new Date(parsed);
}

/**
 * @fn formatDateToISODateString
 * @brief Formats a Date to YYYY-MM-DD (UTC).
 * @type function
 * @details Used to round-trip validate calendar dates (e.g. reject "1989-11-31" because
 *          it rolls over to a different date).
 * @param d - { Date } Date to format.
 * @returns { string } ISO date string YYYY-MM-DD.
 */
function formatDateToISODateString(d: Date): string {
  const y: number = d.getUTCFullYear();
  const m: number = d.getUTCMonth() + 1;
  const day: number = d.getUTCDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * @fn isCalendarDateValid
 * @brief Returns whether the parsed date round-trips to the same ISO date string.
 * @type function
 * @details Rejects invalid calendar dates (e.g. "1989-11-31" parses but formats to "1989-12-01").
 * @param inputTrimmed - { string } Client input (trimmed).
 * @param parsed - { Date } Parsed date.
 * @returns { boolean } True if input represents a valid calendar date.
 */
function isCalendarDateValid(inputTrimmed: string, parsed: Date): boolean {
  return formatDateToISODateString(parsed) === inputTrimmed;
}

/**
 * @fn isDateOfBirthProvided
 * @brief Returns whether the client provided a non-empty dateOfBirth value.
 * @type function
 */
function isDateOfBirthProvided(value: string | undefined): boolean {
  return (
    value !== undefined &&
    typeof value === 'string' &&
    value.trim() !== ''
  );
}

/**
 * @class ItemsService
 * @brief Service responsible for CRUD operations on Item entities.
 * @type class
 * @details Injects TypeORM Repository<Item>. All methods perform repository calls;
 *          findOne and update throw NotFoundException when the item does not exist.
 */
@Injectable()
export class ItemsService {
  /**
   * @brief Constructor injecting the TypeORM repository for Item.
   * @details Used by NestJS dependency injection; in unit tests this dependency
   *          is replaced with a mock repository (jest.fn() or custom mock object).
   * @param itemRepository - { Repository<Item> } TypeORM repository for Item entity.
   */
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  /**
   * @fn create
   * @brief Creates a new item in the database.
   * @type function
   * @details Validates that dto.name is a non-empty string, then builds an Item instance
   *          with name, description, dateOfBirth, sex, phoneNumber, address (defaults for
   *          optional), saves it via the repository, and returns the persisted entity
   *          including id, createdAt, and updatedAt.
   * @param dto - { CreateItemDto } Incoming create payload (name required; others optional).
   * @returns { Promise<Item> } The saved item with id, createdAt, and updatedAt set.
   * @throws { BadRequestException } When name is missing, not a string, or empty/whitespace.
   * @throws { BadRequestException } When dateOfBirth is provided but not a valid ISO date.
   */
  async create(dto: CreateItemDto): Promise<Item> {
    const name: string | undefined = dto.name;
    if (name === undefined || typeof name !== 'string' || name.trim() === '') {
      throw new BadRequestException('name is required and must be a non-empty string');
    }
    const dateOfBirth: Date | null = parseDateOfBirth(dto.dateOfBirth);
    if (isDateOfBirthProvided(dto.dateOfBirth)) {
      const inputTrimmed: string = (dto.dateOfBirth as string).trim();
      if (
        dateOfBirth === null ||
        !isCalendarDateValid(inputTrimmed, dateOfBirth)
      ) {
        throw new BadRequestException(INVALID_DATE_OF_BIRTH_MESSAGE);
      }
    }
    const item: Item = this.itemRepository.create({
      name: name.trim(),
      description: dto.description ?? '',
      dateOfBirth,
      sex: (dto.sex ?? '').trim(),
      phoneNumber: (dto.phoneNumber ?? '').trim(),
      address: (dto.address ?? '').trim(),
    });
    return this.itemRepository.save(item);
  }

  /**
   * @fn findAll
   * @brief Returns all items from the database.
   * @type function
   * @details Calls repository.find() with no criteria; returns array (possibly empty).
   * @returns { Promise<Item[]> } All items in the database.
   */
  async findAll(): Promise<Item[]> {
    return this.itemRepository.find({
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * @fn findOne
   * @brief Returns a single item by id.
   * @type function
   * @details Validates id is a valid UUID; if not, throws BadRequestException (400).
   *          Queries by id; if not found, throws NotFoundException (404). Otherwise returns the item.
   * @param id - { string } UUID of the item.
   * @returns { Promise<Item> } The item if found.
   * @throws { BadRequestException } When id is not a valid UUID format.
   * @throws { NotFoundException } When no item exists with the given id.
   */
  async findOne(id: string): Promise<Item> {
    if (!isValidUuid(id)) {
      throw new BadRequestException('Invalid UUID format');
    }
    const item: Item | null = await this.itemRepository.findOne({ where: { id } });
    if (item === null) {
      throw new NotFoundException(`Item with id "${id}" not found`);
    }
    return item;
  }

  /**
   * @fn update
   * @brief Updates an existing item by id.
   * @type function
   * @details Loads the item with findOne (throws if not found), applies partial update
   *          from DTO (name, description, dateOfBirth, sex, phoneNumber, address), then saves.
   *          Only provided fields are updated; updatedAt is set automatically by TypeORM.
   * @param id - { string } UUID of the item to update.
   * @param dto - { UpdateItemDto } Partial fields to update.
   * @returns { Promise<Item> } The updated item.
   * @throws { BadRequestException } When dateOfBirth is provided but not a valid ISO date.
   * @throws { NotFoundException } When no item exists with the given id.
   */
  async update(id: string, dto: UpdateItemDto): Promise<Item> {
    const item: Item = await this.findOne(id);
    if (dto.name !== undefined) {
      item.name = dto.name;
    }
    if (dto.description !== undefined) {
      item.description = dto.description;
    }
    if (dto.dateOfBirth !== undefined) {
      const parsed: Date | null = parseDateOfBirth(dto.dateOfBirth);
      if (isDateOfBirthProvided(dto.dateOfBirth)) {
        const inputTrimmed: string = (dto.dateOfBirth as string).trim();
        if (
          parsed === null ||
          !isCalendarDateValid(inputTrimmed, parsed)
        ) {
          throw new BadRequestException(INVALID_DATE_OF_BIRTH_MESSAGE);
        }
      }
      item.dateOfBirth = parsed;
    }
    if (dto.sex !== undefined) {
      item.sex = dto.sex.trim();
    }
    if (dto.phoneNumber !== undefined) {
      item.phoneNumber = dto.phoneNumber.trim();
    }
    if (dto.address !== undefined) {
      item.address = dto.address.trim();
    }
    return this.itemRepository.save(item);
  }

  /**
   * @fn remove
   * @brief Deletes an item by id.
   * @type function
   * @details Loads the item with findOne (throws if not found), then removes it.
   *          Returns the removed entity for confirmation.
   * @param id - { string } UUID of the item to delete.
   * @returns { Promise<Item> } The removed item.
   * @throws { NotFoundException } When no item exists with the given id.
   */
  async remove(id: string): Promise<Item> {
    const item: Item = await this.findOne(id);
    await this.itemRepository.remove(item);
    return item;
  }
}
