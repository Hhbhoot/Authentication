import { NextRequest, NextResponse } from 'next/server';
import { handleSocialLogin, generateTokens, setAuthCookies } from '@/lib/auth';
import { env } from '@/lib/env';
import AuditLog from '@/models/AuditLog';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${env.NEXT_PUBLIC_URL}/login?error=no_code`);
  }

  try {
    // 1. Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_ID!,
        client_secret: env.GOOGLE_SECRET!,
        redirect_uri: `${env.NEXT_PUBLIC_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const { access_token, id_token } = await tokenResponse.json();

    if (!access_token) {
      throw new Error('Failed to exchange code for tokens');
    }

    // 2. Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + access_token);
    const googleUser = await userResponse.json();

    // 3. Upsert user in DB
    const { userId, role } = await handleSocialLogin({
      email: googleUser.email,
      name: googleUser.name,
      provider: 'google',
      socialId: googleUser.id,
      avatarUrl: googleUser.picture,
    });

    // 4. Create Session
    const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const { accessToken, refreshToken } = await generateTokens(
      { userId, role },
      { ip: ipAddress, userAgent }
    );

    await setAuthCookies(accessToken, refreshToken);

    // 5. Audit Log
    await AuditLog.create({
      userId,
      action: 'login',
      status: 'success',
      ipAddress,
      userAgent,
      details: { provider: 'google' },
    });

    return NextResponse.redirect(`${env.NEXT_PUBLIC_URL}/dashboard`);
  } catch (error) {
    console.error('Google OAuth Error:', error);
    return NextResponse.redirect(`${env.NEXT_PUBLIC_URL}/login?error=oauth_failed`);
  }
}
