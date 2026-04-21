import mongoose, { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  name: string;
  email: string;
  password?: string;
  provider: 'local' | 'google' | 'github';
  socialId?: string;
  role: mongoose.Types.ObjectId;
  isVerified: boolean;
  isBlocked: boolean;
  twoFactorSecret?: string;
  isTwoFactorEnabled: boolean;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: false, // Optional for social login
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local',
      required: true,
    },
    socialId: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple nulls for local users
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    avatarUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (this: any) {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
  } catch (error: any) {
    throw error;
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

const User = models.User || model('User', UserSchema);

export default User;
