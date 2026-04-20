'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Card } from '@/components/ui';
import { Mail, Lock, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { TwoFactorChallenge } from '@/components/TwoFactorChallenge';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const verified = searchParams.get('verified');

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{ userId: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.twoFactorRequired) {
          setTwoFactorData({ userId: data.userId });
          return;
        }

        toast.success(`Welcome back, ${data.user.name}!`);
        router.push(callbackUrl);
        router.refresh();
      } else {
        toast.error(data.error || 'Something went wrong');
      }
    } catch (err) {
      toast.error('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (twoFactorData) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="w-full max-w-md">
          <TwoFactorChallenge 
            userId={twoFactorData.userId} 
            onSuccess={() => {
              router.push(callbackUrl);
              router.refresh();
            }}
            onCancel={() => setTwoFactorData(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Welcome Back</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Sign in to manage your account</p>
        </div>

        {verified && (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-4 text-sm font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 text-center">
            Email verified successfully! You can now log in.
          </div>
        )}

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Email Address"
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Password"
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                  Remember me
                </label>
              </div>

              <Link href="/forgot-password" title="Coming soon" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              <LogIn className="mr-2 h-4 w-4" /> Sign in
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Create one for free
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
