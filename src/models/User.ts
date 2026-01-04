import mongoose, { Schema } from "mongoose";

export type UserDocument = {
  username: string;
  usernameLower: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

const UserSchema = new Schema<UserDocument>(
  {
    username: { type: String, required: true },
    usernameLower: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);
