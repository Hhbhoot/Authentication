import mongoose from 'mongoose';
import '@/models/User';
import '@/models/Role';
import '@/models/Token';
import '@/models/AuditLog';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function bootstrapAdmin() {
  try {
    const Role = mongoose.model('Role');
    const User = mongoose.model('User');

    // 1. Ensure Roles exist
    let adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      adminRole = await Role.create({ name: 'admin', permissions: ['all'] });
      console.log('✨ Bootstrap: Created "admin" role');
    }

    if (!(await Role.findOne({ name: 'user' }))) {
      await Role.create({ name: 'user', permissions: [] });
      console.log('✨ Bootstrap: Created "user" role');
    }

    // 2. Ensure Admin User exists
    const adminEmail = 'admin@auth.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: 'Admin@123', // Will be hashed by UserSchema pre-save hook
        role: adminRole._id,
        isVerified: true,
      });
      console.log(`🚀 Bootstrap: Created default admin account (${adminEmail})`);
    }
  } catch (error) {
    console.error('❌ Bootstrap Error:', error);
  }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then(async (mongoose) => {
      // Run bootstrap on initial connection
      await bootstrapAdmin();
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

export default connectDB;
