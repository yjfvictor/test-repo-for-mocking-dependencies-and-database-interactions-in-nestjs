/**
 * @file validate-content-type.spec.ts
 * @brief Unit tests for getContentTypeValidationError and Content-Type/charset validation.
 * @details Covers GET/DELETE (no validation), POST/PATCH/PUT with valid and invalid
 *          Content-Type and charset, and edge cases (array header, empty charset).
 * @author Victor Yeh
 * @date 2026-02-20
 * @copyright MIT License
 */

import { Request } from 'express';
import {
  getContentTypeValidationError,
  CONTENT_TYPE_ERROR_BODY,
  CHARSET_ERROR_BODY,
} from './validate-content-type';

/**
 * @fn createMockRequest
 * @brief Creates a minimal Express Request with the given method and headers.
 * @type function
 * @param method - { string } HTTP method.
 * @param headers - { Record<string, unknown> } Request headers (e.g. 'content-type').
 * @returns { Request } Mock request object.
 */
function createMockRequest(
  method: string,
  headers: Record<string, unknown> = {},
): Request {
  return {
    method,
    headers,
  } as unknown as Request;
}

describe('getContentTypeValidationError', () => {
  it('should return null for GET requests', () => {
    const req: Request = createMockRequest('GET');
    expect(getContentTypeValidationError(req)).toBeNull();
  });

  it('should return null for DELETE requests', () => {
    const req: Request = createMockRequest('DELETE');
    expect(getContentTypeValidationError(req)).toBeNull();
  });

  it('should return CONTENT_TYPE_ERROR_BODY when POST has no Content-Type', () => {
    const req: Request = createMockRequest('POST', {});
    expect(getContentTypeValidationError(req)).toEqual(CONTENT_TYPE_ERROR_BODY);
  });

  it('should return CONTENT_TYPE_ERROR_BODY when POST has empty Content-Type', () => {
    const req: Request = createMockRequest('POST', {
      'content-type': '',
    });
    expect(getContentTypeValidationError(req)).toEqual(CONTENT_TYPE_ERROR_BODY);
  });

  it('should return CONTENT_TYPE_ERROR_BODY when POST has wrong Content-Type', () => {
    const req: Request = createMockRequest('POST', {
      'content-type': 'text/plain',
    });
    expect(getContentTypeValidationError(req)).toEqual(CONTENT_TYPE_ERROR_BODY);
  });

  it('should return null when POST has Content-Type application/json', () => {
    const req: Request = createMockRequest('POST', {
      'content-type': 'application/json',
    });
    expect(getContentTypeValidationError(req)).toBeNull();
  });

  it('should return null when POST has application/json and charset=utf-8', () => {
    const req: Request = createMockRequest('POST', {
      'content-type': 'application/json; charset=utf-8',
    });
    expect(getContentTypeValidationError(req)).toBeNull();
  });

  it('should return null when POST has application/json and charset=UTF-8', () => {
    const req: Request = createMockRequest('POST', {
      'content-type': 'application/json; charset=UTF-8',
    });
    expect(getContentTypeValidationError(req)).toBeNull();
  });

  it('should return null when POST has application/json and charset=utf8', () => {
    const req: Request = createMockRequest('POST', {
      'content-type': 'application/json; charset=utf8',
    });
    expect(getContentTypeValidationError(req)).toBeNull();
  });

  it('should return CHARSET_ERROR_BODY when POST has unsupported charset', () => {
    const req: Request = createMockRequest('POST', {
      'content-type': 'application/json; charset=radnom',
    });
    expect(getContentTypeValidationError(req)).toEqual(CHARSET_ERROR_BODY);
  });

  it('should return CHARSET_ERROR_BODY when POST has charset=iso-8859-1', () => {
    const req: Request = createMockRequest('POST', {
      'content-type': 'application/json; charset=iso-8859-1',
    });
    expect(getContentTypeValidationError(req)).toEqual(CHARSET_ERROR_BODY);
  });

  it('should return CHARSET_ERROR_BODY when PATCH has unsupported charset', () => {
    const req: Request = createMockRequest('PATCH', {
      'content-type': 'application/json; charset=us-ascii',
    });
    expect(getContentTypeValidationError(req)).toEqual(CHARSET_ERROR_BODY);
  });

  it('should return null when PATCH has application/json and charset=utf-8', () => {
    const req: Request = createMockRequest('PATCH', {
      'content-type': 'application/json; charset=utf-8',
    });
    expect(getContentTypeValidationError(req)).toBeNull();
  });

  it('should handle Content-Type as array and use first element', () => {
    const req: Request = createMockRequest('POST', {
      'content-type': ['application/json; charset=radnom'],
    });
    expect(getContentTypeValidationError(req)).toEqual(CHARSET_ERROR_BODY);
  });

  it('should return CONTENT_TYPE_ERROR_BODY when Content-Type array is empty', () => {
    const req: Request = createMockRequest('POST', {
      'content-type': [],
    });
    expect(getContentTypeValidationError(req)).toEqual(CONTENT_TYPE_ERROR_BODY);
  });

  it('should return null when charset= is present but value is empty', () => {
    const req: Request = createMockRequest('POST', {
      'content-type': 'application/json; charset=',
    });
    expect(getContentTypeValidationError(req)).toBeNull();
  });
});
