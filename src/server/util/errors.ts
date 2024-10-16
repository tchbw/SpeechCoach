import { HttpStatusCode } from "axios";
import type { UnknownRecord } from "type-fest";

export class ClayboardAPIError extends Error {
  statusCode: HttpStatusCode = HttpStatusCode.InternalServerError;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class APIForbiddenError extends ClayboardAPIError {
  statusCode = HttpStatusCode.Forbidden;
}

export class APIUnauthenticatedError extends ClayboardAPIError {
  statusCode = HttpStatusCode.Unauthorized;
}

export class APINotFoundError extends ClayboardAPIError {
  statusCode = HttpStatusCode.NotFound;
}

export class ErrorWithContext extends Error {
  context: UnknownRecord;

  constructor(
    message: string,
    { context = {}, cause }: { context?: UnknownRecord; cause?: Error } = {}
  ) {
    super(message, { cause });
    this.context = context;
  }
}
