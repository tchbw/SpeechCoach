export function returnUndefinedForNullish<T>(
  value: T | null | undefined
): T | undefined {
  return value ?? undefined;
}
