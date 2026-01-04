import mongoose, { Schema } from "mongoose";

export type EntryDocument = {
  userId: mongoose.Types.ObjectId;
  date: Date;
  feelingLabel: string;
  feelingScore: number;
  reason: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

const EntrySchema = new Schema<EntryDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    feelingLabel: { type: String, required: true },
    feelingScore: { type: Number, required: true },
    reason: { type: String, required: true },
    imageUrl: { type: String }
  },
  { timestamps: true }
);

EntrySchema.index({ userId: 1, date: -1 });

export const Entry =
  mongoose.models.Entry || mongoose.model<EntryDocument>("Entry", EntrySchema);
