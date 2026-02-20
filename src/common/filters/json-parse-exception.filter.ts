/**
 * @file json-parse-exception.filter.ts
 * @brief Exception filter for JSON and encoding errors in the request body.
 * @details Catches invalid JSON (e.g. SyntaxError) and decoding/encoding failures
 *          (e.g. invalid UTF-8). Returns HTTP 400 with a clear message so the client
 *          knows to send valid JSON and use a decodable encoding.
 * @author Victor Yeh
 * @date 2026-02-20
 * @copyright MIT License
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * @var JSON_PARSE_ERROR_MESSAGE
 * @brief Message returned to the client when the request body is not valid JSON.
 * @type string
 * @details Used in the filter response body and for detecting body-parser JSON errors.
 */
const JSON_PARSE_ERROR_MESSAGE: string =
  'Request body must be valid JSON.';

/**
 * @var ENCODING_ERROR_MESSAGE
 * @brief Message returned when the request body could not be decoded (e.g. invalid UTF-8).
 * @type string
 * @details Tells the client to use a decodable encoding such as UTF-8.
 */
const ENCODING_ERROR_MESSAGE: string =
  'Request body could not be decoded. Use an encoding that can be decoded (e.g. UTF-8).';

/**
 * @fn isEncodingError
 * @brief Determines whether the exception is from a decoding/encoding failure.
 * @type function
 * @details Invalid UTF-8 or unsupported charset can cause errors whose message
 *          mentions encoding, decode, utf, invalid character, or invalid byte.
 * @param exception - { unknown } The caught exception.
 * @returns { boolean } True if the exception indicates an encoding/decoding failure.
 */
function isEncodingError(exception: unknown): boolean {
  if (exception instanceof HttpException) {
    return false;
  }
  const message: string =
    typeof (exception as { message?: string }).message === 'string'
      ? (exception as { message: string }).message
      : '';
  const lower: string = message.toLowerCase();
  return (
    lower.includes('encoding') ||
    lower.includes('charset') ||
    lower.includes('decode') ||
    lower.includes('invalid utf') ||
    lower.includes('invalid character') ||
    lower.includes('invalid byte') ||
    (lower.includes('utf') && lower.includes('invalid'))
  );
}

/**
 * @fn isJsonParseError
 * @brief Determines whether the exception is from invalid JSON in the request body.
 * @type function
 * @details Body-parser and similar middleware set status 400 and often a message
 *          containing "Unexpected token" or "JSON". SyntaxError is the typical type.
 * @param exception - { unknown } The caught exception.
 * @returns { boolean } True if the exception indicates a JSON parse failure.
 */
function isJsonParseError(exception: unknown): boolean {
  if (exception instanceof SyntaxError) {
    return true;
  }
  if (exception instanceof HttpException) {
    return false;
  }
  const err = exception as { statusCode?: number; status?: number; message?: string };
  const status: number | undefined = err.statusCode ?? err.status;
  const message: string = typeof err.message === 'string' ? err.message : '';
  if (status === HttpStatus.BAD_REQUEST) {
    const lower: string = message.toLowerCase();
    return (
      lower.includes('json') ||
      lower.includes('unexpected token') ||
      lower.includes('parse')
    );
  }
  return false;
}

/**
 * @class JsonParseExceptionFilter
 * @brief Global exception filter that maps JSON parse errors to a 400 response.
 * @type class
 * @details Catches exceptions that indicate the request body was not valid JSON
 *          and sends a consistent 400 Bad Request with a JSON body describing the error.
 */
@Catch()
export class JsonParseExceptionFilter implements ExceptionFilter {
  /**
   * @fn catch
   * @brief Handles the exception and sends the response.
   * @type function
   * @details If the exception is a JSON parse error, responds with 400 and a message.
   *          Otherwise delegates to the default behaviour (rethrow so Nest can handle).
   * @param exception - { unknown } The exception thrown.
   * @param host - { ArgumentsHost } Nest arguments host to get the response object.
   * @returns { void }
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse<Response>();

    if (isEncodingError(exception)) {
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: ENCODING_ERROR_MESSAGE,
      });
      return;
    }

    if (isJsonParseError(exception)) {
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: JSON_PARSE_ERROR_MESSAGE,
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status: number = exception.getStatus();
      const body: unknown = exception.getResponse();
      response.status(status).json(body);
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred.',
    });
  }
}
