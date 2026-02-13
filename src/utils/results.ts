export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: any } };

export const success = <T>(data: T): Result<T> => ({ success: true, data });
export const failure = (
  code: string,
  message: string,
  details?: any,
): Result<never> => ({
  success: false,
  error: { code, message, details },
});
