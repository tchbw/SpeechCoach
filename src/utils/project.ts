import type { ChatMessageThread } from "@prisma/client";
import { z } from "zod";

import type { ProjectDocumentWithDefaults } from "@/server/services/project/model";

export const projectChatFormSchema = z.discriminatedUnion(`questionType`, [
  z.object({
    questionType: z.literal(`pageRange`),
    range: z
      .object({
        pageRangeStart: z
          .string()
          .regex(/^\d+$/)
          .refine((n) => parseInt(n) > 0, {
            message: `Page range start must be a positive integer`,
          }),
        pageRangeEnd: z
          .string()
          .regex(/^\d+$/)
          .refine((n) => parseInt(n) > 0, {
            message: `Page range end must be a positive integer`,
          }),
      })
      .refine(
        (val) => Number(val.pageRangeEnd) <= Number(val.pageRangeStart) + 9,
        {
          message: `Page range can be at most 10 pages`,
          path: [`pageRangeEnd`],
        }
      ),
  }),
  z.object({
    questionType: z.literal(`fullDocument`),
  }),
]);
export type ProjectChatForm = z.infer<typeof projectChatFormSchema>;

export function flattenAndSortChatThreads(
  documents: ProjectDocumentWithDefaults[]
): ChatMessageThread[] {
  const allThreads = documents.flatMap((doc) => doc.ChatThreads);
  return allThreads.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
