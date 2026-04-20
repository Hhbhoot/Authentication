import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';
import { getCurrentUser } from '@/lib/auth';
import { UAParser } from 'ua-parser-js';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get all refresh tokens for the user
    const tokens = await Token.find({ 
      userId: session.userId, 
      type: 'refresh' 
    }).sort({ updatedAt: -1 });

    const cookieStore = await cookies();
    const currentRefreshToken = cookieStore.get('refreshToken')?.value;

    const sessionList = tokens.map(t => {
      // @ts-ignore
      const parser = new (UAParser as any)(t.userAgent || '');
      const device = parser.getDevice();
      const os = parser.getOS();
      const browser = parser.getBrowser();

      return {
        id: t._id,
        ip: t.ip || 'Unknown',
        device: `${browser.name || 'Unknown Browser'} on ${os.name || 'Unknown OS'} ${os.version || ''}`,
        isCurrent: t.token === currentRefreshToken,
        lastActive: t.updatedAt,
      };
    });

    return NextResponse.json({ sessions: sessionList });
  } catch (error) {
    console.error('Fetch sessions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentRefreshToken = req.cookies.get('refreshToken')?.value;

    await connectDB();
    
    // Revoke all OTHER sessions
    const result = await Token.deleteMany({
      userId: session.userId,
      type: 'refresh',
      token: { $ne: currentRefreshToken }
    });

    return NextResponse.json({ 
      message: `Revoked ${result.deletedCount} sessions successfully` 
    });
  } catch (error) {
    console.error('Revoke all sessions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
