import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import dbConnect from '../src/lib/mongodb';

async function testConnection() {
  console.log('Testing MongoDB connection details...');
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
      console.error('❌ MONGODB_URI is not defined');
      process.exit(1);
  }

  // Mask password for output
  const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
  console.log('Target URI:', maskedUri);

  try {
    const conn = await dbConnect();
    // Use the native mongo driver connection from mongoose
    const db = conn.connection.db;

    if (!db) {
        throw new Error('Database connection established but db object is null');
    }

    console.log('✅ Connection established via Mongoose state:', mongoose.connection.readyState);
    console.log('   (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)');

    console.log('Stats: Retrieving collections...');
    const collections = await db.listCollections().toArray();
    
    console.log(`✅ Successfully listed ${collections.length} collections:`);
    collections.forEach((c: any) => console.log(`   - ${c.name}`));

    if (collections.length === 0) {
        console.log('   (Note: The database is empty or has no collections yet)');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to run database usage check:', error);
    process.exit(1);
  }
}

testConnection();
