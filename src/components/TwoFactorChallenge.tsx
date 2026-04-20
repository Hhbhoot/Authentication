'use client';

import { useState } from 'react';
import { Button, Input, Card } from './ui';
import { ShieldCheck, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface TwoFactorChallengeProps {
  userId: string;
  onSuccess: (userData: any) => void;
  onCancel: () => void;
}

export const TwoFactorChallenge = ({ userId, onSuccess, onCancel }: TwoFactorChallengeProps) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Authenticated successfully!`);
        onSuccess(data.user);
      } else {
        toast.error(data.error || 'Invalid 2FA code');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-8 border-indigo-100 bg-indigo-50/10 shadow-2xl">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="p-4 bg-indigo-100 rounded-3xl">
          <ShieldCheck className="h-10 w-10 text-indigo-600" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Second Factor Required</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-[280px]">
            Please enter the 6-digit code from your authenticator app to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <Input
            label="Verification Code"
            placeholder="000 000"
            className="text-center text-2xl tracking-[0.5em] font-bold h-14"
            maxLength={6}
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          
          <div className="flex flex-col gap-3">
            <Button type="submit" className="w-full h-12" isLoading={isLoading} disabled={code.length !== 6}>
              Verify & Sign In <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="ghost" type="button" className="w-full text-slate-500" onClick={onCancel}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};
