/**
 * @file json-content-type.guard.spec.ts
 * @brief Unit tests for JsonContentTypeGuard.
 * @details Ensures the guard allows GET/DELETE without Content-Type, allows POST/PATCH/PUT
 *          when Content-Type is application/json, and throws BadRequestException otherwise.
 * @author Victor Yeh
 * @date 2026-02-20
 * @copyright MIT License
 */

import { ExecutionContext } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { JsonContentTypeGuard } from './json-content-type.guard';

/**
 * @fn createMockContext
 * @brief Creates a minimal ExecutionContext with the given request props.
 * @type function
 * @param request - { object } Partial request (method, headers).
 * @returns { ExecutionContext } Mock context for the guard.
 */
function createMockContext(request: {
  method: string;
  headers?: Record<string, string>;
}): ExecutionContext {
  const mockRequest: { method: string; headers: Record<string, string> } = {
    method: request.method,
    headers: request.headers ?? {},
  };
  return {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
    }),
  } as unknown as ExecutionContext;
}

describe('JsonContentTypeGuard', () => {
  const guard: JsonContentTypeGuard = new JsonContentTypeGuard();

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow GET requests without Content-Type', () => {
    const ctx: ExecutionContext = createMockContext({ method: 'GET' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow DELETE requests without Content-Type', () => {
    const ctx: ExecutionContext = createMockContext({ method: 'DELETE' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow POST when Content-Type is application/json', () => {
    const ctx: ExecutionContext = createMockContext({
      method: 'POST',
      headers: { 'content-type': 'application/json' },
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow POST when Content-Type is application/json with charset', () => {
    const ctx: ExecutionContext = createMockContext({
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw BadRequestException when POST has no Content-Type', () => {
    const ctx: ExecutionContext = createMockContext({ method: 'POST' });

    expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
    expect(() => guard.canActivate(ctx)).toThrow(
      'Content-Type must be application/json. Send the request body in JSON format.',
    );
  });

  it('should throw BadRequestException when POST has empty Content-Type', () => {
    const ctx: ExecutionContext = createMockContext({
      method: 'POST',
      headers: { 'content-type': '' },
    });

    expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
  });

  it('should throw BadRequestException when POST has wrong Content-Type', () => {
    const ctx: ExecutionContext = createMockContext({
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
    });

    expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
    expect(() => guard.canActivate(ctx)).toThrow(
      'Content-Type must be application/json. Send the request body in JSON format.',
    );
  });

  it('should throw BadRequestException when PATCH has wrong Content-Type', () => {
    const ctx: ExecutionContext = createMockContext({
      method: 'PATCH',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });

    expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
  });

  it('should allow PATCH when Content-Type is application/json', () => {
    const ctx: ExecutionContext = createMockContext({
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow POST when charset is utf-8', () => {
    const ctx: ExecutionContext = createMockContext({
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw BadRequestException when charset is us-ascii (only UTF-8 supported)', () => {
    const ctx: ExecutionContext = createMockContext({
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=us-ascii' },
    });
    expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
    expect(() => guard.canActivate(ctx)).toThrow(
      'Unsupported or invalid encoding. Use an encoding that can be decoded (e.g. UTF-8: Content-Type: application/json; charset=utf-8).',
    );
  });

  it('should throw BadRequestException when charset is unsupported', () => {
    const ctx: ExecutionContext = createMockContext({
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=iso-8859-1' },
    });

    expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
    expect(() => guard.canActivate(ctx)).toThrow(
      'Unsupported or invalid encoding. Use an encoding that can be decoded (e.g. UTF-8: Content-Type: application/json; charset=utf-8).',
    );
  });

  it('should throw BadRequestException when charset is unknown', () => {
    const ctx: ExecutionContext = createMockContext({
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=unknown-encoding' },
    });

    expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
    expect(() => guard.canActivate(ctx)).toThrow(
      'Unsupported or invalid encoding. Use an encoding that can be decoded (e.g. UTF-8: Content-Type: application/json; charset=utf-8).',
    );
  });
});
