import { createSaltedHash } from "@/utils/crypto";

export function createLoginCodeHash({
  code,
  email,
}: {
  code: string;
  email: string;
}) {
  return createSaltedHash(code, email);
}
