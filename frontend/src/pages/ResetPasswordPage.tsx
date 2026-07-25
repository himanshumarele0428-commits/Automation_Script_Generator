import { useState } from 'react';
import { Link, useSearchParams, Navigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { SparklesIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { addToast } = useToast();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) return <Navigate to="/login" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      addToast('Password reset successfully', 'success');
    } catch {
      addToast('Invalid or expired token', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 shadow-lg shadow-primary-500/25">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-surface-900 dark:text-white">AI Script Gen</h1>
        </div>

        <Card>
          {done ? (
            <div className="text-center py-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-success-50 dark:bg-success-50/10 mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-success-600 dark:text-success-400" />
              </div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Password updated!</h2>
              <p className="text-surface-500 dark:text-surface-400 text-sm mb-6">
                Your password has been changed successfully.
              </p>
              <Link to="/login" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700">
                &larr; Sign in with new password
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-surface-900 dark:text-white">Set new password</h2>
                <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
                  Enter your new password below.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">New Password</label>
                  <div className="relative">
                    <LockClosedIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="At least 6 characters"
                      className="w-full rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 pl-10 pr-4 py-2.5 text-sm placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all duration-200"
                    />
                  </div>
                </div>
                <Button type="submit" loading={loading} size="lg" className="w-full">
                  Reset Password
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
