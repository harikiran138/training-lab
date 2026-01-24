import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
// resolve path relative to this script (scripts/test-db.ts -> .env.local)
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import dbConnect from '../src/lib/mongodb';

async function testConnection() {
  console.log('Testing MongoDB connection...');
  // Mask password for safety in output
  const uri = process.env.MONGODB_URI;
  const maskedUri = uri ? uri.replace(/:([^:@]+)@/, ':****@') : 'undefined';
  console.log('URI:', maskedUri);

  try {
    await dbConnect();
    console.log('✅ Successfully connected to MongoDB!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

testConnection();
