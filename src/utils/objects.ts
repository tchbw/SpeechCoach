import type { SetNonNullable } from "type-fest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const removeNullValues = <T extends { [key: string]: any }>(
  obj: T
): Partial<SetNonNullable<T>> => {
  const helper = (clone: T) => {
    Object.keys(clone).forEach((key) => {
      if (clone[key] && typeof clone[key] === `object`) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        helper(clone[key]);
      } else if (clone[key] === null) {
        delete clone[key];
      }
    });
    return clone;
  };

  return helper(structuredClone(obj));
};
