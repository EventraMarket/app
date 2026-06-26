import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IMarket extends Document {
  conditionId: string;
  questionId: string;
  title: string;
  category: string;
  outcomes: string[];
  outcomeSlotCount: number;
  creator: string;          // wallet address
  resolver: string;         // SimpleResolver address
  resolved: boolean;
  winner: string | null;    // "Yes", "No", or outcome label
  winnerIndex: number | null;
  txHash: string;
  blockNumber: number;
  chainId: number;    
  fpmmAddress?: string;       // blockchain ID (84532=Base Sepolia, 44787=Celo Sepolia)
  createdAt: Date;
  resolvedAt: Date | null;
  resolvedBy: string | null; // admin wallet
  resolveTxHash: string | null;
}

const MarketSchema = new Schema<IMarket>(
  {
    conditionId:    { type: String, required: true, index: true },
    questionId:     { type: String, required: true, index: true },
    title:          { type: String, required: true },
    category:       { type: String, default: "Other" },
    outcomes:       { type: [String], default: ["Yes", "No"] },
    outcomeSlotCount: { type: Number, default: 2 },
    creator:        { type: String, required: true, lowercase: true, index: true },
    resolver:       { type: String, required: true, lowercase: true },
    resolved:       { type: Boolean, default: false },
    winner:         { type: String, default: null },
    winnerIndex:    { type: Number, default: null },
    txHash:         { type: String, required: true },
    blockNumber:    { type: Number, required: true },
    chainId:        { type: Number, required: true, index: true },
    fpmmAddress:    { type: String, default: null },
    resolvedAt:     { type: Date, default: null },
    resolvedBy:     { type: String, default: null, lowercase: true },
    resolveTxHash:  { type: String, default: null },
  },
  { timestamps: true }
);

// Compound index for unique conditionId per chain
MarketSchema.index({ conditionId: 1, chainId: 1 }, { unique: true });

export const Market = models.Market ?? model<IMarket>("Market", MarketSchema);
