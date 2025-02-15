import mongoose, { Document, Model, Schema } from "mongoose";

/**interface for basic snippet */
export interface ISnippet extends Document {
  snippetId: string;
  title: string;
  description: string;
  code: string;
  tag: string;
  createdAt: Date;
  createdBy: string;
  parentFolderId: string;
}

/**schema for snippet */
const SnippetSchema = new Schema<ISnippet>({
  snippetId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  code: { type: String, required: true },
  tag: { type: String, required: true },
  createdAt: { type: Date, required: true },
  createdBy: { type: String, required: true },
  parentFolderId: { type: String, required: true },
});

/**check if this Snippet model exists right now or not */
const Snippet: Model<ISnippet> =
  mongoose.models.Snippet || mongoose.model<ISnippet>("Snippet", SnippetSchema);

export default Snippet;
