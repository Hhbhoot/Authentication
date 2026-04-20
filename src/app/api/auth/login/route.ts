import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Role from '@/models/Role';
import AuditLog from '@/models/AuditLog';
import { generateTokens, setAuthCookies } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  let userId: string | null = null;
  const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  try {
    const body = await req.json();
    const validatedData = loginSchema.parse(body);

    await connectDB();

    // 1. Find user and include password for comparison
    const user = await User.findOne({ email: validatedData.email }).select('+password').populate('role');
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    userId = user._id.toString();

    // 2. Check if user is blocked
    if (user.isBlocked) {
      return NextResponse.json({ error: 'Account is blocked' }, { status: 403 });
    }

    // 3. Verify password
    const isMatch = await user.comparePassword(validatedData.password);
    if (!isMatch) {
      // Log failed attempt
      await AuditLog.create({
        userId,
        action: 'login',
        status: 'failure',
        ipAddress,
        userAgent,
        details: { reason: 'invalid_password' },
      });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 3. Check for 2FA
    if (user.isTwoFactorEnabled) {
      return NextResponse.json({ 
        twoFactorRequired: true,
        userId: user._id,
        message: 'Two-factor authentication required'
      });
    }

    // 4. Generate tokens with session metadata
    const { accessToken, refreshToken } = await generateTokens(
      { userId: user._id as string, role: user.role.name },
      { ip: ipAddress, userAgent }
    );

    await setAuthCookies(accessToken, refreshToken);

    // 5. Log successful login
    await AuditLog.create({
      userId,
      action: 'login',
      status: 'success',
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
