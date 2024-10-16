export class AuthenticationError extends Error {}

export class EmailNotFoundError extends AuthenticationError {
  message = `Email not found`;
}

export class LoginCodeInvalidError extends AuthenticationError {
  message = `Login code invalid`;
}

export class LoginCodeAlreadyUsedError extends AuthenticationError {
  message = `Login code already used`;
}

export class LoginCodeExpiredError extends AuthenticationError {
  message = `Login code expired`;
}

export class PasswordInvalidError extends AuthenticationError {
  message = `Password invalid`;
}

export class PasswordNotConfiguredError extends AuthenticationError {
  message = `Password not configured`;
}
