import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crt_analytics';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/* eslint-disable no-var */
declare global {
  var mongoose: { conn: any; promise: any } | undefined;
}
/* eslint-enable no-var */

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // Ensure cached is initialized if it somehow becomes undefined between calls (though unlikely in a single-threaded Node.js context)
  // This also helps with type inference within the function if `cached` was only conditionally initialized outside.
  if (!cached) {
      cached = global.mongoose = { conn: null, promise: null };
  }
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
