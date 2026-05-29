import mongoose, { Schema, model, models, Document } from "mongoose";

export type TxType = "split" | "merge" | "redeem" | "resolve" | "approve";

export interface ITransaction extends Document {
  txHash: string;
  type: TxType;
  wallet: string;           // who sent the tx
  conditionId: string | null;
  questionId: string | null;
  amount: string;           // formatted mUSDC (or "0" for resolve/approve)
  amountRaw: string;        // bigint as string
  outcomeIndex: number | null; // which outcome the user chose (0=Yes, 1=No, etc.)
  blockNumber: number;
  timestamp: Date;
  network: string;
  success: boolean;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    txHash:       { type: String, required: true, unique: true, index: true },
    type:         { type: String, enum: ["split", "merge", "redeem", "resolve", "approve"], required: true },
    wallet:       { type: String, required: true, lowercase: true, index: true },
    conditionId:  { type: String, default: null, index: true },
    questionId:   { type: String, default: null },
    amount:       { type: String, default: "0" },
    amountRaw:    { type: String, default: "0" },
    outcomeIndex: { type: Number, default: null },
    blockNumber:  { type: Number, required: true },
    timestamp:    { type: Date, required: true },
    network:      { type: String, default: "base-sepolia" },
    success:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Transaction = models.Transaction ?? model<ITransaction>("Transaction", TransactionSchema);
