import mongoose, { Document, Model, Schema } from "mongoose";

/**interface for folder */
export interface IFolder extends Document {
  folderId: string;
  title: string;
  createdAt: Date;
  createdBy: string;
  snippetIds: string[];
  totalSnippets: number;
  userId: string;
}

/**schema for folder */
const SnippetSchema = new Schema<IFolder>({
  folderId: { type: String, required: true },
  title: { type: String, required: true },
  createdAt: { type: Date, required: true },
  createdBy: { type: String, required: true },
  snippetIds: { type: [String], required: true },
  totalSnippets: { type: Number, required: true },
  userId: { type: String, required: true },
});

/**check if this Folder model exists right now or not */
const Folder: Model<IFolder> =
  mongoose.models.Folder || mongoose.model<IFolder>("Folder", SnippetSchema);

export default Folder;
