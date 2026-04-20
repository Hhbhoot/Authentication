'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { User, Shield, Ban, CheckCircle, ChevronLeft, ChevronRight, Loader2, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
  isBlocked: boolean;
  role: { name: string };
  createdAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${page}&limit=10&search=${debouncedSearch}&status=${status}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearch, status]);

  const handleUpdateUser = async (userId: string, updates: any) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success('User updated successfully');
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Update failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">User Management</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Manage account access, roles, and status for all users.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex w-full sm:w-64 items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <Search className="h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search name or email..." 
              className="w-full text-sm bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex w-full sm:w-48 items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <Filter className="h-4 w-4 text-slate-400" />
            <select 
              className="w-full text-sm bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 cursor-pointer"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                        {user.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{user.name}</div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.role.name === 'admin' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {user.role.name === 'admin' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      {user.role.name.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isBlocked ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                        Blocked
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                        user.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end gap-2">
                       <Button 
                        variant="ghost" 
                        className={`h-8 px-2 ${user.isBlocked ? 'text-emerald-600 hover:text-emerald-700' : 'text-red-500 hover:text-red-600'}`}
                        onClick={() => handleUpdateUser(user._id, { isBlocked: !user.isBlocked })}
                        isLoading={actionLoading === user._id}
                      >
                        {user.isBlocked ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-8 px-3 text-xs"
                        onClick={() => handleUpdateUser(user._id, { roleName: user.role.name === 'admin' ? 'user' : 'admin' })}
                        isLoading={actionLoading === user._id}
                      >
                        {user.role.name === 'admin' ? 'Demote' : 'Promote'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Showing <span className="font-bold text-slate-900">{(page-1)*10 + 1}</span> to <span className="font-bold text-slate-900">{Math.min(page*10, pagination.total)}</span> of <span className="font-bold text-slate-900">{pagination.total}</span> users
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 px-3" 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 px-3" 
                disabled={page === pagination.pages}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
