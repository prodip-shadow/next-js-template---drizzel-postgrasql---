import { ZodError } from "zod";

export class AppError extends Error {
  constructor(message, statusCode = 400, code = "APP_ERROR") {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", issues = []) {
    super(message, 422, "VALIDATION_ERROR");
    this.issues = issues;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

/**
 * Converts any thrown error into a safe client-facing message.
 * Never exposes internal SQL errors, stack traces, or secrets.
 */
export function getSafeErrorMessage(error) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message || "Invalid input provided.";
  }

  if (error instanceof AppError) {
    return error.message;
  }

  console.error("[ServerError]", error);
  return "Something went wrong. Please try again.";
}
