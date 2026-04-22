import { env } from '@/lib/env';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import Token from '@/models/Token';

const ACCESS_TOKEN_SECRET = env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = env.JWT_REFRESH_SECRET;

const ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived
const REFRESH_TOKEN_EXPIRY = '7d'; // Long-lived

export interface TokenPayload {
  userId: string;
  role: string;
}

export const generateTokens = async (
  payload: TokenPayload, 
  metadata?: { ip?: string; userAgent?: string }
) => {
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY as any,
  });

  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY as any,
  });

  // Save refresh token to DB with metadata
  await Token.create({
    userId: payload.userId,
    token: refreshToken,
    type: 'refresh',
    ip: metadata?.ip,
    userAgent: metadata?.userAgent,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const setAuthCookies = async (accessToken: string, refreshToken: string) => {
  const cookieStore = await cookies();

  // Set Access Token
  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  });

  // Set Refresh Token
  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
};

export const clearAuthCookies = async () => {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
};

export const getCurrentUser = async (): Promise<TokenPayload | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;
  return verifyAccessToken(token);
};

/**
 * Handles Social Login Upsert logic
 * Find or create a user based on social provider info
 */
export const handleSocialLogin = async (data: {
  email: string;
  name: string;
  provider: 'google' | 'github';
  socialId: string;
  avatarUrl?: string;
}) => {
  // We need to import inside to avoid circular dependencies if any
  const User = (await import('@/models/User')).default;
  const Role = (await import('@/models/Role')).default;
  const connectDB = (await import('@/lib/mongodb')).default;

  await connectDB();

  // 1. Check if user exists by email
  let user = await User.findOne({ email: data.email }).populate('role');

  if (user) {
    // If user exists, ensure they are linked to this provider or have a socialId
    if (!user.socialId || user.provider === 'local') {
      user.socialId = data.socialId;
      user.provider = data.provider;
      if (data.avatarUrl && !user.avatarUrl) user.avatarUrl = data.avatarUrl;
      await user.save();
    }
  } else {
    // 2. Create new user if doesn't exist
    let userRole = await Role.findOne({ name: 'user' });
    if (!userRole) {
      userRole = await Role.create({ name: 'user', permissions: [] });
    }

    user = await User.create({
      email: data.email,
      name: data.name,
      provider: data.provider,
      socialId: data.socialId,
      avatarUrl: data.avatarUrl,
      role: userRole._id,
      isVerified: true, // Social emails are trusted/verified by provider
    });
    
    // Refresh user object to get populated role name
    user = await User.findById(user._id).populate('role');
  }

  return {
    userId: user._id.toString(),
    role: user.role.name,
  };
};
