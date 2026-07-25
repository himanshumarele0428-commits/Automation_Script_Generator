import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import { SparklesIcon, UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function SignupPage() {
  const { signup, token } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({ email: '', username: '', password: '', full_name: '' });
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        email: form.email,
        username: form.username,
        password: form.password,
        full_name: form.full_name.trim() || undefined,
      };
      await signup(payload);
      addToast('Account created successfully!', 'success');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string | { msg: string }[] } } };
      const detail = axiosErr?.response?.data?.detail;
      let message = 'Registration failed. Please try again.';
      if (typeof detail === 'string') {
        message = detail;
      } else if (Array.isArray(detail)) {
        message = detail.map((d: { msg: string }) => d.msg).join(', ');
      }
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-4/12 relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(99,102,241,0.3),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(20,184,166,0.2),_transparent_50%)]" />
        <div className="relative flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">AI Script Gen</h1>
              <p className="text-xs text-primary-200">Automation Platform</p>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white leading-tight">
              Start Automating Today
            </h2>
            <p className="text-primary-200 text-base leading-relaxed">
              Create your free account and start generating production-ready
              automation scripts powered by AI.
            </p>
          </div>
          <p className="text-primary-300 text-xs">
            &copy; {new Date().getFullYear()} AI Script Gen. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden text-center mb-10">
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 shadow-lg shadow-primary-500/25">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-surface-900 dark:text-white">AI Script Gen</h1>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Create your account</h2>
            <p className="text-surface-500 dark:text-surface-400 mt-1">Start generating automation scripts in minutes</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 pl-10 pr-4 py-2.5 text-sm placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all duration-200"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                  minLength={3}
                  placeholder="johndoe"
                  className="w-full rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-4 py-2.5 text-sm placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">Email</label>
              <div className="relative">
                <EnvelopeIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 pl-10 pr-4 py-2.5 text-sm placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">Password</label>
              <div className="relative">
                <LockClosedIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 pl-10 pr-4 py-2.5 text-sm placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all duration-200"
                />
              </div>
            </div>

            <Button type="submit" loading={loading} size="lg" className="w-full">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
