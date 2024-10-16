import crypto from "crypto";

export function createSaltedHash(data: string, salt: string) {
  return crypto
    .createHash(`sha512`)
    .update(salt + data)
    .digest(`hex`);
}
