
import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ITransaction extends Document {
  txHash: string;
  type: string; // "split" | "merge" | "redeem" | "resolve" | "approve" | "fpmm_buy" | "fpmm_sell"
  wallet: string;
  conditionId: string | null;
  questionId: string | null;
  amount: string; // human-readable amount (e.g., "10")
  amountRaw: string; // raw bigint string
  outcomeIndex: number | null;
  blockNumber: number;
  timestamp: Date;
  chainId: number;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    txHash: { type: String, required: true, index: true, unique: true },
    type: {
      type: String,
      required: true,
      enum: ["split", "merge", "redeem", "resolve", "approve", "fpmm_buy", "fpmm_sell"],
    },
    wallet: { type: String, required: true, lowercase: true, index: true },
    conditionId: { type: String, default: null, index: true },
    questionId: { type: String, default: null },
    amount: { type: String, default: "0" },
    amountRaw: { type: String, default: "0" },
    outcomeIndex: { type: Number, default: null },
    blockNumber: { type: Number, required: true, index: true },
    timestamp: { type: Date, default: Date.now },
    chainId: { type: Number, default: 42220, index: true }, // default to Celo Mainnet
  },
  { timestamps: true }
);

export const Transaction = models.Transaction ?? model<ITransaction>("Transaction", TransactionSchema);