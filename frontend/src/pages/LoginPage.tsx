import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import { SparklesIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const { login, token } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      addToast('Welcome back!', 'success');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const message = axiosErr?.response?.data?.detail || 'Invalid email or password';
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
              Generate Automation Scripts with AI
            </h2>
            <p className="text-primary-200 text-base leading-relaxed">
              Transform manual test steps into production-ready automation code
              across Selenium, Playwright, Cypress, and Robot Framework.
            </p>
            <div className="flex gap-3 pt-4">
              {['Selenium', 'Playwright', 'Cypress', 'Robot'].map((fw) => (
                <span key={fw} className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/10">
                  {fw}
                </span>
              ))}
            </div>
          </div>
          <p className="text-primary-300 text-xs">
            &copy; {new Date().getFullYear()} AI Script Gen. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 shadow-lg shadow-primary-500/25">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-surface-900 dark:text-white">AI Script Gen</h1>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Welcome back</h2>
            <p className="text-surface-500 dark:text-surface-400 mt-1">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">Email</label>
              <div className="relative">
                <EnvelopeIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 pl-10 pr-4 py-2.5 text-sm placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <LockClosedIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 pl-10 pr-4 py-2.5 text-sm placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all duration-200"
                />
              </div>
            </div>

            <Button type="submit" loading={loading} size="lg" className="w-full">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700">
              Create free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
