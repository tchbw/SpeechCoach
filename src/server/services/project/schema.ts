import { z } from "zod";

export const editGeneratedParagraphSchema = z
  .object({
    editSuggestion: z.string().optional(),
    templateSuggestion: z.string().optional(),
  })
  .refine(
    (data) => data.editSuggestion != null || data.templateSuggestion != null,
    {
      message: `Please provide an edit suggestion`,
      path: [`editSuggestion`],
    }
  );

export type EditGeneratedParagraph = z.infer<
  typeof editGeneratedParagraphSchema
>;
