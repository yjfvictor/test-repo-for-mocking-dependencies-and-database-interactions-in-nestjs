/**
 * @file json-content-type.guard.ts
 * @brief Guard that requires Content-Type: application/json and a decodable charset.
 * @details For POST, PATCH, and PUT, ensures Content-Type is application/json and, if
 *          charset is present, that it is a supported encoding (e.g. UTF-8). Rejects
 *          unsupported or invalid encoding with 400 and a clear message.
 * @author Victor Yeh
 * @date 2026-02-20
 * @copyright MIT License
 */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { getContentTypeValidationError } from '../validate-content-type';

/**
 * @class JsonContentTypeGuard
 * @brief Guard that rejects requests without application/json for POST, PATCH, PUT.
 * @type class
 * @details Uses shared getContentTypeValidationError; throws BadRequestException when invalid.
 */
@Injectable()
export class JsonContentTypeGuard implements CanActivate {
  /**
   * @fn canActivate
   * @brief Checks that body-modifying requests have Content-Type: application/json and a supported charset.
   * @type function
   * @details Delegates to getContentTypeValidationError; if non-null throws BadRequestException with that message.
   * @param context - { ExecutionContext } Nest execution context (request, etc.).
   * @returns { boolean } True if the request is allowed.
   * @throws { BadRequestException } When Content-Type is wrong or charset is unsupported.
   */
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const error: { statusCode: number; error: string; message: string } | null =
      getContentTypeValidationError(request);
    if (error !== null) {
      throw new BadRequestException(error.message);
    }
    return true;
  }
}
