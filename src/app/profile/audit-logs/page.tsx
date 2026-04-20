'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { 
  Shield, 
  ChevronLeft, 
  Clock, 
  LogIn, 
  ShieldCheck, 
  Lock, 
  User as UserIcon, 
  AlertCircle,
  Monitor,
  Smartphone,
  Globe,
  Loader2,
  XCircle,
  CheckCircle2,
  Lock as LockIcon,
  Unlock
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AuditLog {
  _id: string;
  action: string;
  status: 'success' | 'failure';
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  details?: any;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/user/audit-logs');
        const data = await res.json();
        if (res.ok) {
          setLogs(data.logs);
        }
      } catch (err) {
        toast.error('Failed to load activity logs');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getActionIcon = (action: string, status: string) => {
    if (status === 'failure') return <XCircle className="h-5 w-5 text-red-500" />;
    
    switch (action) {
      case 'login':
      case 'login_2fa':
        return <LogIn className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
      case 'password_change':
        return <LockIcon className="h-5 w-5 text-amber-500" />;
      case 'profile_update':
        return <UserIcon className="h-5 w-5 text-blue-500" />;
      case 'account_blocked':
        return <Lock className="h-5 w-5 text-red-600" />;
      case 'account_unblocked':
        return <Unlock className="h-5 w-5 text-emerald-600" />;
      default:
        return <Clock className="h-5 w-5 text-slate-400" />;
    }
  };

  const getFriendlyDevice = (ua: string) => {
    if (!ua) return 'Unknown Device';
    if (ua.includes('iPhone') || ua.includes('Android')) return 'Mobile Device';
    if (ua.includes('Windows') || ua.includes('Macintosh')) return 'Desktop Computer';
    return 'Unknown Device';
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Security Activity</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Detailed record of your recent security events.</p>
            </div>
          </div>
          <div className="hidden sm:flex p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
            <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {logs.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No activity recorded yet.</div>
            ) : (
              logs.map((log) => (
                <div key={log._id} className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm`}>
                        {getActionIcon(log.action, log.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 capitalize">
                            {log.action.replace(/_/g, ' ')}
                          </h4>
                          {log.status === 'failure' && (
                            <span className="text-[10px] font-black bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded uppercase">Failed Attempt</span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Monitor className="h-3.5 w-3.5" />
                            {getFriendlyDevice(log.userAgent)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5" />
                            {log.ipAddress}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {log.details && (
                    <div className="mt-4 ml-14 p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <pre className="text-[10px] text-slate-500 dark:text-slate-400 font-mono whitespace-pre-wrap leading-relaxed">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          Showing up to 50 most recent security events.
        </p>
      </div>
    </div>
  );
}
