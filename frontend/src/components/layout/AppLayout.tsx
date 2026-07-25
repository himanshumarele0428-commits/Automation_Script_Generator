import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import ThemeToggle from '../ui/ThemeToggle';
import Spinner from '../ui/Spinner';
import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function AppLayout() {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="flex flex-col items-center gap-4">
          <Spinner />
          <p className="text-sm text-surface-500 dark:text-surface-400">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Sidebar />
      <div className="ml-64">
        {/* Header */}
        <header className="h-16 border-b border-surface-200 dark:border-surface-800 bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Search scripts, prompts…"
                className="w-64 pl-10 pr-4 py-2 text-sm rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 placeholder:text-surface-400"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
              <BellIcon className="w-5 h-5 text-surface-500 dark:text-surface-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full ring-2 ring-white dark:ring-surface-950" />
            </button>
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-3 pl-3 ml-1 border-l border-surface-200 dark:border-surface-800">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-600 text-white text-sm font-semibold shadow-sm shadow-primary-500/25">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate max-w-[120px]">
                    {user.email?.split('@')[0]}
                  </p>
                  <p className="text-[11px] text-surface-400 dark:text-surface-500 capitalize">
                    {user.role || 'User'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function ProtectedRoute() {
  const { token, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
  if (!token) return <Navigate to="/login" replace />;
  return <AppLayout />;
}
