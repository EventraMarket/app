

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

/**
 * Global is used here to maintain a cached connection across hot-reloads
 * in development. This prevents connections from growing exponentially
 * during API route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return { 
      client: mongoose, 
      db: cached.conn.db // Exposes the native MongoDB Db object directly
    };
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      return m;
    });
  }

  try {
    const mongooseInstance = await cached.promise;
    cached.conn = mongooseInstance.connection;
    
    return { 
      client: mongooseInstance, 
      db: mongooseInstance.connection.db // Exposes the native .collection() methods seamlessly
    };
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}