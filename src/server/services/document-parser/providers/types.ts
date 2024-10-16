import { z } from "zod";

// This is not the exact schema, but it works for now bc we are forcing the result to be url
export const reductoParseResponseSchema = z.object({
  result: z.object({
    type: z.literal(`url`), // Note: If you want to allow 'full' as well, use z.enum(['url', 'full'])
    url: z.string(),
    result_id: z.string(),
  }),
});

export type ReductoParseResponse = z.infer<typeof reductoParseResponseSchema>;

export const reductoParseResultBlockSchema = z.object({
  type: z.enum([
    `Header`,
    `Footer`,
    `Title`,
    `Section Header`,
    `Page Number`,
    `List Item`,
    `Figure`,
    `Table`,
    `Key Value`,
    `Text`,
    `List`,
  ]),
  bbox: z.object({
    left: z.number(),
    top: z.number(),
    width: z.number(),
    height: z.number(),
    page: z.number().int().positive(), // 1-indexed page number
  }),
  content: z.string(),
});

export const reductoParseResultSchema = z
  .object({
    content: z.string(),
    embed: z.string(),
    enriched: z.string().nullable(),
    enrichment_success: z.boolean(),
    blocks: z.array(reductoParseResultBlockSchema),
  })
  .array();

export type ReductoParseResultBlock = z.infer<
  typeof reductoParseResultBlockSchema
>;
export type ReductoParseResult = z.infer<typeof reductoParseResultSchema>;
