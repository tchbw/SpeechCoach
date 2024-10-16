import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// This was added by shadcn
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
