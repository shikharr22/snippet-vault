import * as z from "zod";

/**new snippet schema for zod validation */
export const newSnippetSchema = z.object({
  title: z
    .string()
    .min(3, "Tile must be at least 3 characters")
    .max(100, "Title must be at most 100 characters")
    .regex(/^[a-zA-Z0-9 ]*$/, "Title must not contain special characters"),
  description: z.string().optional(),
  code: z
    .string()
    .min(5, "Code is mandatory and should be at least 5 characters"),
  tags: z.array(z.string().min(1)),
  parentFolderId: z.string().optional(),
});
