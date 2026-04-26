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
    
    if (tokenData.error) {
      console.error('GitHub Token Exchange Error:', tokenData.error, tokenData.error_description);
      throw new Error(`GitHub Token Error: ${tokenData.error_description || tokenData.error}`);
    }

    const access_token = tokenData.access_token;

    if (!access_token) {
      console.error('GitHub Token Exchange failed - no access_token in response:', tokenData);
      throw new Error('Failed to exchange code for access token');
    }

    // 2. Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { 
        'Authorization': `Bearer ${access_token}`,
        'User-Agent': 'NextJS-Auth-System'
      },
    });
    const githubUser = await userResponse.json();

    if (!userResponse.ok) {
      console.error('GitHub Profile Fetch Error:', githubUser);
      throw new Error(`GitHub Profile Error: ${githubUser.message || userResponse.statusText}`);
    }

    // 3. GitHub emails can be private, so fetch them separately
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: { 
        'Authorization': `Bearer ${access_token}`,
        'User-Agent': 'NextJS-Auth-System'
      },
    });
    const emails = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('GitHub Emails Fetch Error:', emails);
      throw new Error(`GitHub Email Error: ${emails.message || emailResponse.statusText}`);
    }

    let primaryEmail = null;
    if (Array.isArray(emails)) {
      primaryEmail = emails.find((e: any) => e.primary && e.verified)?.email || emails[0]?.email;
    } else {
      console.error('GitHub Emails response is not an array:', emails);
    }

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
  } catch (error: any) {
    console.error('GitHub OAuth Full Error:', error.message || error);
    // You can optionally pass the error message to the login page for debugging
    // return NextResponse.redirect(`${env.NEXT_PUBLIC_URL}/login?error=oauth_failed&message=${encodeURIComponent(error.message)}`);
    return NextResponse.redirect(`${env.NEXT_PUBLIC_URL}/login?error=oauth_failed`);
  }
}
