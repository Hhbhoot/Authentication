import Link from 'next/link';
import { Button } from '@/components/ui';
import { Shield, Lock, Zap, CheckCircle, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-slate-600 ring-1 ring-slate-900/10 hover:ring-slate-900/20">
              Announcing our production-ready auth system.{' '}
              <a href="#" className="font-semibold text-indigo-600">
                <span className="absolute inset-0" aria-hidden="true"></span>Read more <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-6xl">
            Secure, Scalable, and Premium Authentication
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
            A production-ready Next.js 14 auth system with MongoDB, JWT, and best security practices. 
            Built for developers who care about clean architecture and rich aesthetics.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/register">
              <Button className="h-12 px-8 text-lg rounded-full">
                <UserPlus className="mr-2 h-5 w-5" /> Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="h-12 px-8 text-lg rounded-full border border-slate-200 dark:border-slate-800 dark:text-slate-200">
                <LogIn className="mr-2 h-5 w-5" /> Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mx-auto mt-32 max-w-7xl sm:mt-40">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-start bg-white dark:bg-slate-900/50 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md dark:hover:bg-slate-900/80">
              <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 p-3 mb-6">
                <Shield className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Secure by Design</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                JWT tokens with rotation, Bcrypt password hashing, and HTTP-only cookies for maximum security.
              </p>
            </div>

            <div className="flex flex-col items-start bg-white dark:bg-slate-900/50 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md dark:hover:bg-slate-900/80">
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 p-3 mb-6">
                <Zap className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Lightning Fast</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Leveraging Next.js App Router and Server Components for zero-flicker protected route access.
              </p>
            </div>

            <div className="flex flex-col items-start bg-white dark:bg-slate-900/50 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md dark:hover:bg-slate-900/80">
              <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 p-3 mb-6">
                <Lock className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Advanced Auth</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Email verification, password resets, and role-based access control built directly into the core.
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-32 text-center sm:mt-40">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Modern Technology Stack</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-4 text-slate-600 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-full">Next.js 14</span>
            <span className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-full">TypeScript</span>
            <span className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-full">MongoDB</span>
            <span className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-full">JWT</span>
            <span className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-full">Tailwind CSS</span>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
      </div>
    </div>
  );
}
