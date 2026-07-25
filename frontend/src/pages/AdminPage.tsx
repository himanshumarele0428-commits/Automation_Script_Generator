import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import { UsersIcon, CodeBracketIcon, BookOpenIcon, BoltIcon } from '@heroicons/react/24/outline';
import type { AdminStats } from '../types/admin';

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [usage, setUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, uRes, usageRes] = await Promise.all([
          axios.get('/api/admin/stats'), axios.get('/api/admin/users'),
          axios.get('/api/admin/analytics/usage?days=7'),
        ]);
        setStats(sRes.data); setUsers(uRes.data); setUsage(usageRes.data);
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="space-y-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Admin Panel</h2>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Platform overview and user management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats?.total_users || 0, icon: UsersIcon, color: 'text-primary-600 dark:text-primary-400' },
          { label: 'Total Scripts', value: stats?.total_scripts || 0, icon: CodeBracketIcon, color: 'text-success-600 dark:text-success-400' },
          { label: 'Total Prompts', value: stats?.total_prompts || 0, icon: BookOpenIcon, color: 'text-accent-600 dark:text-accent-400' },
          { label: 'Active Today', value: stats?.active_users_today || 0, icon: BoltIcon, color: 'text-warning-600 dark:text-warning-400' },
        ].map(item => (
          <div key={item.label} className="stat-card">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800">
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">{item.value}</p>
                <p className="text-xs text-surface-500 dark:text-surface-400">{item.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-4">Daily Usage (Last 7 Days)</h3>
        {usage.length > 0 ? (
          <div className="space-y-1">
            {usage.map((u: any) => (
              <div key={u.date} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                <span className="text-sm font-medium text-surface-700 dark:text-surface-300">{u.date}</span>
                <span className="badge-primary">{u.count} scripts</span>
              </div>
            ))}
          </div>
        ) : <p className="text-surface-400 text-center py-6 text-sm">No data yet</p>}
      </Card>

      <Card padding="none">
        <h3 className="text-sm font-semibold text-surface-900 dark:text-white px-6 pt-5 pb-3">Users</h3>
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50">
                  <th className="text-left py-3 px-6 text-xs font-semibold text-surface-500 uppercase tracking-wider">Email</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-surface-500 uppercase tracking-wider">Username</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-surface-500 uppercase tracking-wider">Role</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-surface-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="py-3 px-6 text-surface-900 dark:text-surface-100">{u.email}</td>
                    <td className="py-3 px-6 text-surface-600 dark:text-surface-400">{u.username}</td>
                    <td className="py-3 px-6"><span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'}`}>{u.role}</span></td>
                    <td className="py-3 px-6 text-surface-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-surface-400 text-center py-8 text-sm">No users found</p>
        )}
      </Card>
    </div>
  );
}
