import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-slate-50/50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-slate-200"></div>
          <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading your experience...</p>
      </div>
    </div>
  );
}
