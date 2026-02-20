/**
 * @file create-item.dto.ts
 * @brief Data transfer object for creating a new item.
 * @details Used by the controller to validate and type the request body when creating an item.
 * @author Victor Yeh
 * @date 2026-02-20
 * @copyright MIT License
 */

/**
 * @interface CreateItemDto
 * @brief Shape of the payload required to create an item.
 * @type interface
 * @details name is required; all other properties are optional and have defaults when omitted.
 */
export interface CreateItemDto {
  /**
   * @brief Display name of the item (required).
   */
  name: string;
  /**
   * @brief Optional description; defaults to empty string if omitted.
   */
  description?: string;
  /**
   * @brief Optional date of birth in ISO date format (YYYY-MM-DD).
   */
  dateOfBirth?: string;
  /**
   * @brief Optional sex (e.g. male, female, other).
   */
  sex?: string;
  /**
   * @brief Optional phone number.
   */
  phoneNumber?: string;
  /**
   * @brief Optional address.
   */
  address?: string;
}
