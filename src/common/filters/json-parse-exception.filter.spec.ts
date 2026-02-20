/**
 * @file json-parse-exception.filter.spec.ts
 * @brief Unit tests for JsonParseExceptionFilter.
 * @details Ensures the filter returns 400 with a clear message for JSON parse errors
 *          (e.g. SyntaxError) and delegates other exceptions appropriately.
 * @author Victor Yeh
 * @date 2026-02-20
 * @copyright MIT License
 */

import { ArgumentsHost, HttpStatus, HttpException } from '@nestjs/common';
import { JsonParseExceptionFilter } from './json-parse-exception.filter';
import { Response } from 'express';

/**
 * @brief Mock Express Response that captures status and json calls.
 */
function createMockResponse(): Response & { _statusCode: number; _body: unknown } {
  const state: { statusCode: number; body: unknown } = {
    statusCode: 0,
    body: undefined,
  };
  const res = {
    _statusCode: 0,
    _body: undefined as unknown,
    status: function (code: number) {
      state.statusCode = code;
      (this as { _statusCode: number })._statusCode = code;
      return this;
    },
    json: function (body: unknown) {
      state.body = body;
      (this as { _body: unknown })._body = body;
      return this;
    },
  } as unknown as Response & { _statusCode: number; _body: unknown };
  res._statusCode = 0;
  res._body = undefined;
  return res;
}

/**
 * @fn createMockHost
 * @brief Creates ArgumentsHost that returns the given response.
 * @type function
 */
function createMockHost(response: Response): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;
}

describe('JsonParseExceptionFilter', () => {
  const filter: JsonParseExceptionFilter = new JsonParseExceptionFilter();

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should return 400 and message when exception is SyntaxError', () => {
    const res = createMockResponse();
    const host: ArgumentsHost = createMockHost(res);
    const exception: SyntaxError = new SyntaxError('Unexpected token }');

    filter.catch(exception, host);

    expect(res._statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(res._body).toEqual({
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'Bad Request',
      message: 'Request body must be valid JSON.',
    });
  });

  it('should return 400 for generic error with status 400 and json in message', () => {
    const res = createMockResponse();
    const host: ArgumentsHost = createMockHost(res);
    const exception = { statusCode: 400, message: 'Invalid JSON in body' };

    filter.catch(exception, host);

    expect(res._statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect((res._body as { message: string }).message).toBe(
      'Request body must be valid JSON.',
    );
  });

  it('should delegate HttpException to response with its status and body', () => {
    const res = createMockResponse();
    const host: ArgumentsHost = createMockHost(res);
    const exception: HttpException = new HttpException(
      { message: 'Custom error' },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    filter.catch(exception, host);

    expect(res._statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(res._body).toEqual({ message: 'Custom error' });
  });

  it('should return 500 for unknown non-JSON errors', () => {
    const res = createMockResponse();
    const host: ArgumentsHost = createMockHost(res);
    const exception: Error = new Error('Some other error');

    filter.catch(exception, host);

    expect(res._statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res._body).toEqual({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred.',
    });
  });

  it('should return 400 and encoding message when exception indicates decoding failure', () => {
    const res = createMockResponse();
    const host: ArgumentsHost = createMockHost(res);
    const exception: Error = new Error('Invalid encoding in request body');

    filter.catch(exception, host);

    expect(res._statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(res._body).toEqual({
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'Bad Request',
      message:
        'Request body could not be decoded. Use an encoding that can be decoded (e.g. UTF-8).',
    });
  });

  it('should return 400 and encoding message for invalid UTF-8 style error', () => {
    const res = createMockResponse();
    const host: ArgumentsHost = createMockHost(res);
    const exception: Error = new Error('Invalid UTF-8 detected in stream');

    filter.catch(exception, host);

    expect(res._statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect((res._body as { message: string }).message).toContain(
      'could not be decoded',
    );
  });
});
