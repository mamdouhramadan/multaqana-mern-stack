/**
 * Backend validation error structure
 */
export interface ValidationError {
  type: string;
  value?: string;
  msg: string;
  path: string;
  location: string;
}

/**
 * Backend API error response
 */
export interface ApiErrorResponse {
  success: false;
  code: number;
  message_code: string;
  message: string;
  data?: ValidationError[];
}

/**
 * Field errors mapped from backend validation errors
 */
export interface FieldErrors {
  [fieldName: string]: string;
}

/**
 * Extract field-level validation errors from API error response
 * 
 * @param error - Axios error object
 * @returns Object with field names as keys and error messages as values
 * 
 * @example
 * ```tsx
 * try {
 *   await authService.login(email, password);
 * } catch (error) {
 *   const fieldErrors = extractFieldErrors(error);
 *   // fieldErrors = { email: "E-mail already in use", password: "Password does not match" }
 * }
 * ```
 */
function hasResponseData(error: unknown): error is { response?: { data?: { data?: unknown } } } {
  return typeof error === 'object' && error !== null && 'response' in error;
}

export function extractFieldErrors(error: unknown): FieldErrors {
  const fieldErrors: FieldErrors = {};

  // Check if error response contains validation errors array
  if (hasResponseData(error) && error.response?.data?.data && Array.isArray(error.response.data.data)) {
    const validationErrors = error.response.data.data as ValidationError[];

    validationErrors.forEach((err) => {
      if (err.path && err.msg) {
        fieldErrors[err.path] = err.msg;
      }
    });
  }

  return fieldErrors;
}

/**
 * Extract general error message from API error response
 * 
 * @param error - Axios error object
 * @param defaultMessage - Fallback message if no error message found
 * @returns Error message string
 */
export function extractErrorMessage(error: unknown, defaultMessage = 'An error occurred'): string {
  if (hasResponseData(error) && error.response?.data && typeof (error.response.data as { message?: string }).message === 'string') {
    return (error.response.data as { message: string }).message;
  }
  if (error instanceof Error) return error.message;
  return defaultMessage;
}

/**
 * Check if error is a validation error (has field-level errors)
 * 
 * @param error - Axios error object
 * @returns True if error contains validation errors
 */
export function isValidationError(error: unknown): boolean {
  return !!(
    hasResponseData(error) &&
    error.response?.data?.data &&
    Array.isArray(error.response.data.data) &&
    error.response.data.data.length > 0
  );
}
