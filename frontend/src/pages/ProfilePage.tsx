import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { UserIcon, EnvelopeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({ full_name: user?.full_name || '', username: user?.username || '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser(form);
      addToast('Profile updated', 'success');
    } catch { addToast('Failed to update profile', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-8 max-w-2xl animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 text-2xl font-bold">
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Profile</h2>
          <p className="text-surface-500 dark:text-surface-400 mt-0.5">Manage your account information</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">Email</label>
            <div className="relative">
              <EnvelopeIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
              <input value={user?.email || ''} disabled
                className="w-full rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 pl-10 pr-4 py-2.5 text-sm opacity-60 cursor-not-allowed" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">Username</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required
                className="input-base pl-10" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
              <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="input-base pl-10" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">Role</label>
            <div className="relative">
              <ShieldCheckIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
              <input value={user?.role || ''} disabled
                className="w-full rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 pl-10 pr-4 py-2.5 text-sm opacity-60 cursor-not-allowed capitalize" />
            </div>
          </div>

          <Button type="submit" loading={loading} size="lg">Update Profile</Button>
        </form>
      </Card>
    </div>
  );
}
