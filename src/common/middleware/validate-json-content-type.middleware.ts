/**
 * @file validate-json-content-type.middleware.ts
 * @brief Express middleware that validates Content-Type and charset before body parsing.
 * @details Runs before the body parser so unsupported charset is rejected with 400
 *          before any parsing runs. Uses the same rules as JsonContentTypeGuard.
 * @author Victor Yeh
 * @date 2026-02-20
 * @copyright MIT License
 */

import { Request, Response, NextFunction } from 'express';
import { getContentTypeValidationError } from '../validate-content-type';

/**
 * @fn validateJsonContentType
 * @brief Middleware that rejects POST/PATCH/PUT with invalid Content-Type or charset.
 * @type function
 * @details Calls getContentTypeValidationError; if non-null, sends 400 and does not call next().
 * @param req - { Request } Express request.
 * @param res - { Response } Express response.
 * @param next - { NextFunction } Next middleware.
 * @returns { void }
 */
export function validateJsonContentType(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const error: { statusCode: number; error: string; message: string } | null =
    getContentTypeValidationError(req);
  if (error !== null) {
    res.status(error.statusCode).json(error);
    return;
  }
  next();
}
