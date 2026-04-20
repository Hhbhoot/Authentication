import Link from 'next/link';
import { Button } from '@/components/ui';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-red-50">
        <AlertTriangle className="h-12 w-12 text-red-600" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">404 - Page Not Found</h1>
      <p className="mt-4 text-lg text-slate-600 max-w-md">
        The page you are looking for might have been moved, deleted, or never existed in the first place.
      </p>
      <div className="mt-10">
        <Link href="/">
          <Button className="h-12 px-8 rounded-full">
            <Home className="mr-2 h-5 w-5" /> Back to Safety
          </Button>
        </Link>
      </div>
    </div>
  );
}
