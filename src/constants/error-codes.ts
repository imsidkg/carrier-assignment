export const ErrorCodes = {
  VALIDATION_ERROR: { code: 'E-400', message: 'Validation Failed', status: 400 },
  AUTH_FAILED: { code: 'E-401', message: 'Authentication Failed', status: 401 },
  CARRIER_ERROR: { code: 'E-502', message: 'Carrier Service Error', status: 502 },
  INTERNAL_ERROR: { code: 'E-500', message: 'Internal Server Error', status: 500 },
} as const;

export type ErrorCodeKey = keyof typeof ErrorCodes;