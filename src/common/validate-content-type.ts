/**
 * @file validate-content-type.ts
 * @brief Shared validation for Content-Type and charset (UTF-8 only).
 * @details Used by middleware (before body parser) and by the guard. Ensures
 *          POST/PATCH/PUT have application/json and, if charset is present, UTF-8 only.
 * @author Victor Yeh
 * @date 2026-02-20
 * @copyright MIT License
 */

import { Request } from 'express';

/**
 * @var BODY_METHODS
 * @brief HTTP methods that require JSON Content-Type and valid charset.
 * @type readonly string[]
 */
export const BODY_METHODS: readonly string[] = ['POST', 'PATCH', 'PUT'];

/**
 * @var CONTENT_TYPE_JSON
 * @brief Expected type part of Content-Type for JSON.
 * @type string
 */
export const CONTENT_TYPE_JSON: string = 'application/json';

/**
 * @var SUPPORTED_CHARSETS
 * @brief Charsets the server accepts. UTF-8 only.
 * @type readonly string[]
 */
export const SUPPORTED_CHARSETS: readonly string[] = ['utf-8', 'utf8'];

/**
 * @var CONTENT_TYPE_ERROR_BODY
 * @brief Response body when Content-Type is not application/json.
 * @type object
 */
export const CONTENT_TYPE_ERROR_BODY: { statusCode: number; error: string; message: string } = {
  statusCode: 400,
  error: 'Bad Request',
  message:
    'Content-Type must be application/json. Send the request body in JSON format.',
};

/**
 * @var CHARSET_ERROR_BODY
 * @brief Response body when charset is unsupported.
 * @type object
 */
export const CHARSET_ERROR_BODY: { statusCode: number; error: string; message: string } = {
  statusCode: 400,
  error: 'Bad Request',
  message:
    'Unsupported or invalid encoding. Use an encoding that can be decoded (e.g. UTF-8: Content-Type: application/json; charset=utf-8).',
};

/**
 * @fn getContentTypeValidationError
 * @brief Returns an error response body if the request fails Content-Type or charset validation.
 * @type function
 * @details For POST, PATCH, PUT only. Validates Content-Type is application/json and
 *          any charset parameter is UTF-8. Safe against header being array or missing.
 * @param req - { Request } Express request.
 * @returns { object | null } Null if valid, otherwise { statusCode, error, message } to send.
 */
export function getContentTypeValidationError(
  req: Request,
): { statusCode: number; error: string; message: string } | null {
  const method: string = req.method.toUpperCase();
  if (!BODY_METHODS.includes(method)) {
    return null;
  }

  const contentTypeHeader: unknown = req.headers['content-type'];
  const contentType: string =
    typeof contentTypeHeader === 'string'
      ? contentTypeHeader
      : Array.isArray(contentTypeHeader) && contentTypeHeader.length > 0
        ? String(contentTypeHeader[0])
        : '';
  if (contentType.trim() === '') {
    return CONTENT_TYPE_ERROR_BODY;
  }

  const normalized: string = contentType.split(';')[0].trim().toLowerCase();
  if (normalized !== CONTENT_TYPE_JSON) {
    return CONTENT_TYPE_ERROR_BODY;
  }

  const charsetPart: string | undefined = contentType
    .split(';')
    .slice(1)
    .find((p: string) => p.trim().toLowerCase().startsWith('charset='));
  if (charsetPart !== undefined) {
    const rawCharset: string | undefined = charsetPart.split('=')[1];
    const charset: string = (typeof rawCharset === 'string' ? rawCharset : '')
      .trim()
      .toLowerCase()
      .replace(/^["']|["']$/g, '');
    if (charset !== '' && !SUPPORTED_CHARSETS.includes(charset)) {
      return CHARSET_ERROR_BODY;
    }
  }

  return null;
}
