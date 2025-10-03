import mongoose, { Document, Model, Schema } from "mongoose";
import * as z from "zod";

/**interface for basic snippet */
export interface ISnippet extends Document {
  snippetId: string;
  title: string;
  description: string;
  code: string;
  tags: string[];
  createdAt: Date;
  createdBy: string;
  parentFolderId: string;
  parentFolderName: string;
}

/**schema for snippet */
const SnippetSchema = new Schema<ISnippet>({
  snippetId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  code: { type: String, required: true },
  tags: { type: [String], required: true },
  createdAt: { type: Date, required: true },
  createdBy: { type: String, required: true },
  parentFolderId: { type: String, required: true },
  parentFolderName: { type: String, required: true },
});

/**check if this Snippet model exists right now or not */
const Snippet: Model<ISnippet> =
  mongoose.models.Snippet || mongoose.model<ISnippet>("Snippet", SnippetSchema);

export const newSnippetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  code: z.string().min(1, "Code is required"),
  tags: z.array(z.string().min(0)),
  parentFolderId: z.string(),
  parentFolderName: z.string(),
});

export default Snippet;
