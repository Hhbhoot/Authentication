import { z } from 'zod';

const envSchema = z.object({
  // Database
  MONGODB_URI: z.string().url(),

  // JWT Secrets
  JWT_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),

  // Social Login (Optional)
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),
  GOOGLE_ID: z.string().optional(),
  GOOGLE_SECRET: z.string().optional(),

  // SMTP Settings
  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
  SMTP_FROM_NAME: z.string().default('AuthSystem'),
  SMTP_FROM_EMAIL: z.string().email(),

  // App URL
  NEXT_PUBLIC_URL: z.string().url().default('http://localhost:3000'),
  NEXT_URL: z.string().url().default('http://localhost:3000'),

  // Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables. Please check your .env file.');
}

export const env = _env.data;
