import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Role from '@/models/Role';
import Token from '@/models/Token';
import { generateTokens, setAuthCookies } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/mail';
import { z } from 'zod';
import crypto from 'crypto';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    await connectDB();

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // 2. Get default 'user' role
    let userRole = await Role.findOne({ name: 'user' });
    if (!userRole) {
      userRole = await Role.create({ name: 'user', permissions: [] });
    }

    // 3. Create new user
    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
      role: userRole._id,
    });

    // 4. Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await Token.create({
      userId: user._id,
      token: verificationToken,
      type: 'verification',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // 5. Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    // 6. Generate session tokens and set cookies
    const { accessToken, refreshToken } = await generateTokens({
      userId: user._id.toString(),
      role: 'user',
    });

    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: 'user',
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
