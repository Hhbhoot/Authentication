'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Card } from '@/components/ui';
import { User, Lock, Mail, CheckCircle, AlertCircle, Loader2, Smartphone, Monitor, Globe, X, LogOut, History, Camera } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { TwoFactorSetup } from '@/components/TwoFactorSetup';

interface Session {
  id: string;
  ip: string;
  device: string;
  isCurrent: boolean;
  lastActive: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<{ name: string; email: string; isVerified: boolean; isTwoFactorEnabled: boolean; avatarUrl?: string } | null>(null);
  const [profileData, setProfileData] = useState({ name: '' });
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const fetchProfile = async () => {
    try {
      const profileRes = await fetch('/api/user/profile');
      const profileData = await profileRes.json();
      if (profileRes.ok) {
        setUser(profileData.user);
        setProfileData({ name: profileData.user.name });
      }

      const sessionsRes = await fetch('/api/user/sessions');
      const sessionsData = await sessionsRes.json();
      if (sessionsRes.ok) {
        setSessions(sessionsData.sessions);
      }
    } catch (err) {
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      setIsUploadingAvatar(true);
      try {
        const res = await fetch('/api/user/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: reader.result }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success('Avatar updated');
          if (user) setUser({ ...user, avatarUrl: data.avatarUrl });
        } else {
          toast.error(data.error || 'Upload failed');
        }
      } catch (err) {
        toast.error('Network error');
      } finally {
        setIsUploadingAvatar(false);
      }
    };
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Profile updated successfully');
        if (user) setUser({ ...user, name: profileData.name });
      } else {
        toast.error(data.error || 'Update failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password changed. Redirecting to login...');
        setTimeout(() => window.location.href = '/login', 2000);
      } else {
        toast.error(data.error || 'Password change failed');
      }
    } catch (err) {
      toast.error('Request failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRevokeSession = async (id: string) => {
    setIsRevoking(id);
    try {
      const res = await fetch(`/api/user/sessions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Session revoked');
        setSessions(prev => prev.filter(s => s.id !== id));
      } else {
        toast.error('Failed to revoke session');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setIsRevoking(null);
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm('Logout from all other devices?')) return;
    setIsRevoking('all');
    try {
      const res = await fetch('/api/user/sessions', { method: 'DELETE' });
      if (res.ok) {
        toast.success('All other sessions revoked');
        setSessions(prev => prev.filter(s => s.isCurrent));
      } else {
        toast.error('Failed to revoke sessions');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setIsRevoking(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Account Settings</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400 font-medium">Manage your profile, security, and active sessions.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/profile/audit-logs">
              <Button variant="outline" outline>
                <History className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" /> View Activity Logs
              </Button>
            </Link>
            <Button variant="danger" outline onClick={handleRevokeAll} isLoading={isRevoking === 'all'}>
              <LogOut className="mr-2 h-4 w-4" /> Revoke All Other Sessions
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Profile Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> General Info
            </h2>
            <Card className="p-8">
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-indigo-50 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-inner flex items-center justify-center">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                    )}
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white cursor-pointer shadow-lg hover:bg-indigo-700 transition-colors group-hover:scale-110 duration-200">
                    <Camera className="h-4 w-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                  </label>
                </div>
                <p className="mt-4 text-sm font-bold text-slate-900 dark:text-slate-100">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <Input
                  label="Email Address"
                  disabled
                  value={user?.email || ''}
                  className="bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed"
                />
                <Input
                  label="Full Name"
                  value={profileData.name}
                  placeholder="Your Name"
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
                <Button type="submit" className="w-full" isLoading={isUpdating}>
                  Save Changes
                </Button>
              </form>
            </Card>
          </div>

          {/* Security Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Lock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Security & 2FA
            </h2>
            <div className="space-y-6">
              <TwoFactorSetup
                isEnabled={user?.isTwoFactorEnabled || false}
                onStatusChange={fetchProfile}
              />
              <Card className="p-6">
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <Input
                    label="Current Password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  />
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                  <Button variant="outline" type="submit" className="w-full" isLoading={isUpdating}>
                    Change Password
                  </Button>
                </form>
              </Card>
            </div>
          </div>

          {/* Sessions Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-600" /> Active Sessions
            </h2>
            <div className="space-y-4">
              {sessions.map(session => (
                <Card key={session.id} className={`p-4 border shadow-sm transition-all ${session.isCurrent ? 'border-indigo-200 bg-indigo-50/30 dark:bg-indigo-950/20' : 'border-slate-100 dark:border-slate-800'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${session.isCurrent ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        {session.device.toLowerCase().includes('mobile') || session.device.toLowerCase().includes('iphone') || session.device.toLowerCase().includes('android')
                          ? <Smartphone className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                          : <Monitor className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        }
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{session.device}</h4>
                          {session.isCurrent && (
                            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase">Current</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{session.ip}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-tight mt-1 font-medium">Last active: {new Date(session.lastActive).toLocaleString()}</p>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-500 transition-colors"
                        onClick={() => handleRevokeSession(session.id)}
                        isLoading={isRevoking === session.id}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
