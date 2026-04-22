'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Card } from '@/components/ui';
import { Lock, ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

/**
 * ResetPasswordContent handles the actual form logic and search param extraction.
 * Wrapped in Suspense because of useSearchParams requirement.
 */
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!token) {
      toast.error('Missing or invalid reset token');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Password reset successfully!');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        toast.error(data.error || 'Failed to reset password');
      }
    } catch (err) {
      toast.error('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="text-center py-8 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Invalid Link</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          This password reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password" title="Try again" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500">
          Request a new link
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            label="New Password"
            id="password"
            type="password"
            required
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <Input
            label="Confirm New Password"
            id="confirmPassword"
            type="password"
            required
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          <ShieldCheck className="mr-2 h-4 w-4" /> Reset Password
        </Button>

        <div className="text-center">
          <Link href="/login" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
          </Link>
        </div>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Set New Password</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Please enter your new security credentials</p>
        </div>

        <Suspense fallback={
          <Card className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          </Card>
        }>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
