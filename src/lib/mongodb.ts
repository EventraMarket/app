import mongoose from "mongoose";

// Cache the connection across hot-reloads in development (Next.js requirement)
declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: typeof mongoose | null;
}

let cached = global._mongooseConn ?? null;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached) return cached;

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  cached = await mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  });

  global._mongooseConn = cached;
  return cached;
}
