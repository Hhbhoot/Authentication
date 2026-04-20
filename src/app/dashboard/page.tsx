import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAccessToken } from '@/lib/auth';
import { Card, Button } from '@/components/ui';
import { User as UserIcon, Settings, Mail, Shield } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

async function getDashboardData() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) return null;

  const payload = verifyAccessToken(token);
  if (!payload) return null;

  await connectDB();
  const user = await User.findById(payload.userId).populate('role');
  return user;
}

export default async function DashboardPage() {
  const user = await getDashboardData();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-2 text-slate-600">Welcome back, {user.name}!</p>
        </div>

        {!user.isVerified && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Mail className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900">Verify your email</h3>
                <p className="text-sm text-amber-700">Please check your inbox to verify your account.</p>
              </div>
            </div>
            <Link href="/profile">
              <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-100">
                Resend Email
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col items-center text-center p-10">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
              <UserIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Account Settings</h3>
            <p className="mt-2 text-sm text-slate-600 mb-6">Manage your profile information and account email.</p>
            <Link href="/profile" className="mt-auto w-full">
              <Button variant="outline" className="w-full">Edit Profile</Button>
            </Link>
          </Card>

          <Card className="flex flex-col items-center text-center p-10">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
              <Shield className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Security</h3>
            <p className="mt-2 text-sm text-slate-600 mb-6">Keep your account secure by changing your password.</p>
            <Link href="/profile" className="mt-auto w-full">
              <Button variant="outline" className="w-full">Manage Password</Button>
            </Link>
          </Card>

          {user.role.name === 'admin' && (
            <Card className="flex flex-col items-center text-center p-10 border-indigo-100 bg-indigo-50/30">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
                <Settings className="h-8 w-8 text-indigo-700" />
              </div>
              <h3 className="text-lg font-bold text-indigo-900">Admin Console</h3>
              <p className="mt-2 text-sm text-indigo-700 mb-6">Manage users, roles, and view application logs.</p>
              <Link href="/admin/users" className="mt-auto w-full">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Open Admin Panel</Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
