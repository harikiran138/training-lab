import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import dbConnect from '../src/lib/mongodb';
import User from '../src/models/User';

async function checkUsers() {
  await dbConnect();
  const users = await User.find({}, { email: 1, role: 1, active: 1, _id: 0 });
  console.log('Users in DB:', JSON.stringify(users, null, 2));
  process.exit(0);
}

checkUsers().catch(err => { console.error(err); process.exit(1); });
