import mongoose, { Model, Schema } from "mongoose";

export interface IUser extends Document {
  userId: string;
  username: string;
  email: string;
  password: string;
}

const UserSchema = new Schema<IUser>({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
