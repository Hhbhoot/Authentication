'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from './ui';
import { LogOut, User, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  // Simple check to see if we're logged in (for UI purposes)
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setUser({ name: data.user.name, role: data.user.role.name });
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      }
    };
    checkUser();
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md dark:bg-slate-950/80 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
                A
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">AuthSystem</span>
            </Link>
 
            {user && (
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors ${pathname === '/dashboard' ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/admin/users"
                    className={`text-sm font-medium transition-colors ${pathname === '/admin/users' ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}`}
                  >
                    Admin
                  </Link>
                )}
              </div>
            )}
          </div>
 
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/profile" className="flex items-center gap-2 group">
                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                    <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-300">{user.name}</span>
                </Link>
                <Button variant="ghost" className="h-9 w-9 p-0" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              !['/login', '/register'].includes(pathname) && (
                <div className="flex items-center gap-3">
                  <Link href="/login">
                    <Button variant="ghost">Sign in</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Get Started</Button>
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
