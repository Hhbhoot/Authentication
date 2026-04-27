import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function GET() {
  const rootUrl = 'https://github.com/login/oauth/authorize';
  
  const redirect_uri = `${env.NEXT_PUBLIC_URL}/api/auth/github/callback`.replace(/\/+$/, '');
  
  const options = {
    client_id: env.GITHUB_ID!,
    redirect_uri,
    scope: 'user:email',
    state: Math.random().toString(36).substring(7), // Basic state for CSRF protection
  };

  const qs = new URLSearchParams(options);

  return NextResponse.redirect(`${rootUrl}?${qs.toString()}`);
}
