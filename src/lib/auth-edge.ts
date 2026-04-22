import { env } from '@/lib/env';
import { jwtVerify } from 'jose';

const ACCESS_TOKEN_SECRET = env.JWT_SECRET;

export interface TokenPayload {
  userId: string;
  role: string;
}

export const verifyAccessTokenEdge = async (token: string): Promise<TokenPayload | null> => {
  try {
    const secret = new TextEncoder().encode(ACCESS_TOKEN_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
};
