'use client';

import { useState } from 'react';
import { Button, Input, Card } from './ui';
import { ShieldCheck, ShieldAlert, Loader2, QrCode, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface TwoFactorSetupProps {
  isEnabled: boolean;
  onStatusChange: () => void;
}

export const TwoFactorSetup = ({ isEnabled, onStatusChange }: TwoFactorSetupProps) => {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupData, setSetupData] = useState<{ qrCodeUrl: string; secret: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStartSetup = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/setup');
      const data = await res.json();
      if (res.ok) {
        setSetupData(data);
        setIsSettingUp(true);
      } else {
        toast.error(data.error || 'Failed to start 2FA setup');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationCode) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Two-factor authentication enabled!');
        setIsSettingUp(false);
        setSetupData(null);
        onStatusChange();
      } else {
        toast.error(data.error || 'Invalid code');
      }
    } catch (err) {
      toast.error('Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm('Are you sure you want to disable 2FA? This will reduce your account security.')) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/verify', { method: 'DELETE' });
      if (res.ok) {
        toast.success('Two-factor authentication disabled');
        onStatusChange();
      } else {
        toast.error('Failed to disable 2FA');
      }
    } catch (err) {
      toast.error('Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSettingUp && setupData) {
    return (
      <Card className="border-indigo-100 bg-indigo-50/10 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <QrCode className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Setup 2FA</h3>
            <p className="text-xs text-slate-500">Scan the QR code with your authenticator app</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <img src={setupData.qrCodeUrl} alt="2FA QR Code" className="h-48 w-48" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Manual Code</p>
            <code className="text-sm font-mono bg-slate-100 px-3 py-1 rounded-md text-slate-700 select-all">
              {setupData.secret}
            </code>
          </div>
        </div>

        <div className="space-y-4">
          <Input 
            label="Verification Code"
            placeholder="Enter 6-digit code"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          <div className="flex gap-3">
             <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => setIsSettingUp(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleVerifyAndEnable}
              isLoading={isLoading}
              disabled={verificationCode.length !== 6}
            >
              Verify & Enable
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 border transition-all ${isEnabled ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-100'}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isEnabled ? 'bg-emerald-100' : 'bg-slate-100'}`}>
            {isEnabled ? <ShieldCheck className="h-6 w-6 text-emerald-600" /> : <ShieldAlert className="h-6 w-6 text-slate-400" />}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Two-Factor Auth</h3>
            <p className="text-sm text-slate-500">
              {isEnabled ? 'Your account is extra secure.' : 'Add an extra layer of security.'}
            </p>
          </div>
        </div>
        <Button 
          variant={isEnabled ? 'outline' : 'primary'}
          onClick={isEnabled ? handleDisable : handleStartSetup}
          isLoading={isLoading}
        >
          {isEnabled ? 'Disable' : 'Enable'}
        </Button>
      </div>
    </Card>
  );
};
