import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IAdmin extends Document {
  wallet: string;    // lowercase wallet address
  addedAt: Date;
  addedBy: string;   // wallet that granted admin
  active: boolean;
}

const AdminSchema = new Schema<IAdmin>(
  {
    wallet:   { type: String, required: true, unique: true, lowercase: true, index: true },
    addedAt:  { type: Date, default: Date.now },
    addedBy:  { type: String, required: true, lowercase: true },
    active:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Admin = models.Admin ?? model<IAdmin>("Admin", AdminSchema);
