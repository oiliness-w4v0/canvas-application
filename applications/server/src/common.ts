/**
 * 通用 API 响应类型
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: number;
}

/**
 * 成功响应构造器
 */
export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: Date.now(),
  };
}

/**
 * 错误响应构造器
 */
export function errorResponse(code: string, message: string): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
    },
    timestamp: Date.now(),
  };
}

/**
 * 常见错误代码
 */
export const ErrorCodes = {
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const;
