export class AppError extends Error {
  constructor(
    public override message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any,
  ) {
    super(message);
    this.name = this.constructor.name;
    //we are using such error syntax because we want cleaner error response.
    // the "this" keyword puts all the function calls in captureStackTrace
    // and this.constructor is removed from the function calls
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

export class CarrierError extends AppError {
  constructor(message: string, details?: any) {
    super(message, "CARRIER_ERROR", 502, details);
  }
}

export class AuthError extends AppError {
  constructor(message: string, details?: any) {
    super(message, "AUTH_ERROR", 401, details);
  }
}
