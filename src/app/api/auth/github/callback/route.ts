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
    // 1. Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      },
      body: JSON.stringify({
        code,
        client_id: env.GITHUB_ID!,
        client_secret: env.GITHUB_SECRET!,
        redirect_uri: `${env.NEXT_PUBLIC_URL}/api/auth/github/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();
    const access_token = tokenData.access_token;

    if (!access_token) {
      throw new Error('Failed to exchange code for access token');
    }

    // 2. Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `token ${access_token}` },
    });
    const githubUser = await userResponse.json();

    // 3. GitHub emails can be private, so fetch them separately
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: { 'Authorization': `token ${access_token}` },
    });
    const emails = await emailResponse.json();
    const primaryEmail = emails.find((e: any) => e.primary && e.verified)?.email || emails[0]?.email;

    if (!primaryEmail) {
      throw new Error('No verified email found from GitHub');
    }

    // 4. Upsert user in DB
    const { userId, role } = await handleSocialLogin({
      email: primaryEmail,
      name: githubUser.name || githubUser.login,
      provider: 'github',
      socialId: githubUser.id.toString(),
      avatarUrl: githubUser.avatar_url,
    });

    // 5. Create Session
    const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const { accessToken, refreshToken } = await generateTokens(
      { userId, role },
      { ip: ipAddress, userAgent }
    );

    await setAuthCookies(accessToken, refreshToken);

    // 6. Audit Log
    await AuditLog.create({
      userId,
      action: 'login',
      status: 'success',
      ipAddress,
      userAgent,
      details: { provider: 'github' },
    });

    return NextResponse.redirect(`${env.NEXT_PUBLIC_URL}/dashboard`);
  } catch (error) {
    console.error('GitHub OAuth Error:', error);
    return NextResponse.redirect(`${env.NEXT_PUBLIC_URL}/login?error=oauth_failed`);
  }
}
