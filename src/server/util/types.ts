export function assertUnreachable(val: never, msg: string): never {
  throw new Error(
    `Reached unreachable code:\n - message: ${msg}\n - unexpected value: ${
      val as string
    }`
  );
}
