/**
 * @file update-item.dto.ts
 * @brief Data transfer object for updating an existing item.
 * @details Used for PATCH/PUT; all fields are optional so that partial updates are supported.
 * @author Victor Yeh
 * @date 2026-02-20
 * @copyright MIT License
 */

/**
 * @interface UpdateItemDto
 * @brief Shape of the payload for updating an item (partial).
 * @type interface
 * @details Every property is optional; only provided fields are updated.
 */
export interface UpdateItemDto {
  /**
   * @brief New display name, if provided.
   */
  name?: string;
  /**
   * @brief New description, if provided.
   */
  description?: string;
  /**
   * @brief New date of birth in ISO date format (YYYY-MM-DD), if provided.
   */
  dateOfBirth?: string;
  /**
   * @brief New sex, if provided.
   */
  sex?: string;
  /**
   * @brief New phone number, if provided.
   */
  phoneNumber?: string;
  /**
   * @brief New address, if provided.
   */
  address?: string;
}
