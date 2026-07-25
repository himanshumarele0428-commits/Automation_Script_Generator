import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { scriptsApi } from '../api/scripts';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import {
  SparklesIcon, ClockIcon, BookmarkIcon, ArrowRightIcon,
  ChartBarIcon, CodeBracketIcon,
} from '@heroicons/react/24/outline';
import type { DashboardStats } from '../types/script';

const COLORS = ['#6366f1', '#14b8a6', '#f43f6e', '#f59e0b', '#22c55e', '#8b5cf6'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    scriptsApi.dashboardStats().then((res) => setStats(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const frameworkData = stats ? Object.entries(stats.framework_usage).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
  })) : [];

  const languageData = stats ? Object.entries(stats.language_usage).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  })) : [];

  const stats_cards = [
    {
      label: 'Total Scripts',
      value: stats?.total_scripts || 0,
      icon: CodeBracketIcon,
      color: 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400',
    },
    {
      label: "Today's Scripts",
      value: stats?.today_scripts || 0,
      icon: SparklesIcon,
      color: 'bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400',
    },
    {
      label: 'Favorites',
      value: stats?.favorite_scripts || 0,
      icon: BookmarkIcon,
      color: 'bg-warning-50 dark:bg-warning-500/10 text-warning-600 dark:text-warning-400',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Dashboard</h2>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Overview of your automation script generation</p>
        </div>
        <Link
          to="/generate"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-primary-500/20 transition-all duration-200"
        >
          <SparklesIcon className="w-4 h-4" />
          New Script
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats_cards.map((card) => (
          <div key={card.label} className="stat-card animate-slide-up">
            <div className="flex items-center gap-4">
              <div className={`stat-icon ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">{card.value}</p>
                <p className="text-sm text-surface-500 dark:text-surface-400">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-950/50">
              <ChartBarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-base font-semibold text-surface-900 dark:text-white">Framework Usage</h3>
          </div>
          {frameworkData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={frameworkData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.6} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    fontSize: '13px', padding: '10px 14px',
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {frameworkData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-surface-400 dark:text-surface-500 text-center py-12 text-sm">No data yet — generate your first script!</p>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent-50 dark:bg-accent-950/50">
              <ChartBarIcon className="w-5 h-5 text-accent-600 dark:text-accent-400" />
            </div>
            <h3 className="text-base font-semibold text-surface-900 dark:text-white">Language Usage</h3>
          </div>
          {languageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  paddingAngle={3}
                  label={({ name, value }) => `${name} (${value})`}
                  labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                >
                  {languageData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    fontSize: '13px', padding: '10px 14px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-surface-400 dark:text-surface-500 text-center py-12 text-sm">No data yet</p>
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-100 dark:bg-surface-800">
              <ClockIcon className="w-5 h-5 text-surface-500 dark:text-surface-400" />
            </div>
            <h3 className="text-base font-semibold text-surface-900 dark:text-white">Recent Activity</h3>
          </div>
          <Link
            to="/history"
            className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-1 transition-colors"
          >
            View All <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
        {stats?.recent_activity && stats.recent_activity.length > 0 ? (
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {stats.recent_activity.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0 animate-fade-in-left"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 shrink-0">
                    <CodeBracketIcon className="w-4 h-4 text-surface-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                      {item.prompt_text}
                    </p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      {item.framework.replace(/_/g, ' ')} &middot; {item.language}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-surface-400 dark:text-surface-500 shrink-0 ml-4">
                  {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 mx-auto mb-4">
              <SparklesIcon className="w-8 h-8 text-surface-400" />
            </div>
            <p className="text-surface-500 dark:text-surface-400 text-sm mb-3">
              No scripts generated yet
            </p>
            <Link
              to="/generate"
              className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700"
            >
              Create your first script &rarr;
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
