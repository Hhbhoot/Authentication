'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Card } from '@/components/ui';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSubmitted(true);
        toast.success('Reset link sent if account exists');
      } else {
        toast.error(data.error || 'Failed to send reset link');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Reset Password</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Recover your account access</p>
        </div>

        <Card>
          {isSubmitted ? (
            <div className="text-center py-4 space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30">
                <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Check your email</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  We have sent a password reset link to <span className="font-bold text-slate-900 dark:text-slate-200">{email}</span> if it is registered in our system.
                </p>
              </div>
              <Link href="/login" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Enter your registered email address below and we&apos;ll send you a link to reset your password.
              </p>
              
              <Input
                label="Email Address"
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button type="submit" className="w-full" isLoading={isLoading}>
                <Mail className="mr-2 h-4 w-4" /> Send Reset Link
              </Button>

              <div className="text-center">
                <Link href="/login" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
