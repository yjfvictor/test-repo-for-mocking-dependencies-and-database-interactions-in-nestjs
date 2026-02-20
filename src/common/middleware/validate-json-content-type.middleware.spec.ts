/**
 * @file validate-json-content-type.middleware.spec.ts
 * @brief Unit tests for validateJsonContentType middleware.
 * @details Ensures the middleware calls next() when validation passes and sends
 *          400 with the error body when getContentTypeValidationError returns an error.
 * @author Victor Yeh
 * @date 2026-02-20
 * @copyright MIT License
 */

import { Request, Response, NextFunction } from 'express';
import { validateJsonContentType } from './validate-json-content-type.middleware';

/**
 * @fn createMockRequest
 * @brief Creates a minimal Express Request.
 * @type function
 */
function createMockRequest(method: string, contentType?: string): Request {
  const headers: Record<string, string> = {};
  if (contentType !== undefined) {
    headers['content-type'] = contentType;
  }
  return { method, headers } as unknown as Request;
}

/**
 * @fn createMockResponse
 * @brief Creates a mock Response that records status and json calls.
 * @type function
 */
function createMockResponse(): Response & {
  _status: number;
  _body: unknown;
} {
  const state: { status: number; body: unknown } = { status: 0, body: undefined };
  const res = {
    _status: 0,
    _body: undefined as unknown,
    status: function (code: number) {
      state.status = code;
      (this as { _status: number })._status = code;
      return this;
    },
    json: function (body: unknown) {
      state.body = body;
      (this as { _body: unknown })._body = body;
      return this;
    },
  } as unknown as Response & { _status: number; _body: unknown };
  res._status = 0;
  res._body = undefined;
  return res;
}

describe('validateJsonContentType', () => {
  it('should call next() when request is valid (POST with application/json)', () => {
    const req: Request = createMockRequest('POST', 'application/json');
    const res = createMockResponse();
    const next: NextFunction = jest.fn();

    validateJsonContentType(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
    expect(res._status).toBe(0);
  });

  it('should call next() for GET (no validation)', () => {
    const req: Request = createMockRequest('GET');
    const res = createMockResponse();
    const next: NextFunction = jest.fn();

    validateJsonContentType(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res._status).toBe(0);
  });

  it('should send 400 and not call next() when Content-Type is missing for POST', () => {
    const req: Request = createMockRequest('POST');
    const res = createMockResponse();
    const next: NextFunction = jest.fn();

    validateJsonContentType(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res._status).toBe(400);
    expect(res._body).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message:
        'Content-Type must be application/json. Send the request body in JSON format.',
    });
  });

  it('should send 400 and not call next() when charset is unsupported', () => {
    const req: Request = createMockRequest(
      'POST',
      'application/json; charset=radnom',
    );
    const res = createMockResponse();
    const next: NextFunction = jest.fn();

    validateJsonContentType(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res._status).toBe(400);
    expect(res._body).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message:
        'Unsupported or invalid encoding. Use an encoding that can be decoded (e.g. UTF-8: Content-Type: application/json; charset=utf-8).',
    });
  });

  it('should call next() for PUT with application/json and charset=utf-8', () => {
    const req: Request = createMockRequest(
      'PUT',
      'application/json; charset=utf-8',
    );
    const res = createMockResponse();
    const next: NextFunction = jest.fn();

    validateJsonContentType(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res._status).toBe(0);
  });
});
