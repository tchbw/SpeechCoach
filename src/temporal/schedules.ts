import type { ScheduleOptions } from "@temporalio/client";

// function specOnlyInProd<T extends ScheduleSpec>(
//   spec: T
// ): Record<string, never> | T {
//   if (env.NODE_ENV === `production`) {
//     return spec;
//   }
//   return {};
// }

export const schedules: ScheduleOptions[] = [];
