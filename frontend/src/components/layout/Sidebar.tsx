import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon, SparklesIcon, ClockIcon, DocumentTextIcon,
  BookmarkIcon, BookOpenIcon, Cog6ToothIcon, UserIcon,
  ShieldCheckIcon, ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline';

const navSections = [
  {
    label: 'Overview',
    items: [
      { to: '/', icon: HomeIcon, label: 'Dashboard' },
      { to: '/generate', icon: SparklesIcon, label: 'Generate' },
    ],
  },
  {
    label: 'Library',
    items: [
      { to: '/history', icon: ClockIcon, label: 'History' },
      { to: '/saved', icon: BookmarkIcon, label: 'Saved Scripts' },
      { to: '/templates', icon: DocumentTextIcon, label: 'Templates' },
      { to: '/prompts', icon: BookOpenIcon, label: 'Prompts' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { to: '/settings', icon: Cog6ToothIcon, label: 'AI Settings' },
      { to: '/profile', icon: UserIcon, label: 'Profile' },
    ],
  },
];

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
  ${isActive
    ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 shadow-sm'
    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-200'
  }`;

const iconClasses = ({ isActive }: { isActive: boolean }) =>
  `w-5 h-5 shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400 dark:text-surface-500'}`;

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 h-screen bg-white dark:bg-surface-950 border-r border-surface-200 dark:border-surface-800 flex flex-col fixed left-0 top-0 z-20 shadow-sidebar">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-100 dark:border-surface-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-600 shadow-lg shadow-primary-500/25">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-surface-900 dark:text-white tracking-tight">
              AI Script Gen
            </h1>
            <p className="text-[10px] text-surface-400 dark:text-surface-500 font-medium tracking-wide uppercase">
              Automation Platform
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-2 text-[11px] font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClasses}>
                  {({ isActive }) => (
                    <>
                      <item.icon className={iconClasses({ isActive })} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        {user?.role === 'admin' && (
          <div>
            <p className="px-3 mb-2 text-[11px] font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">
              Administration
            </p>
            <NavLink to="/admin" className={linkClasses}>
              {({ isActive }) => (
                <>
                  <ShieldCheckIcon className={iconClasses({ isActive })} />
                  <span>Admin Panel</span>
                </>
              )}
            </NavLink>
          </div>
        )}
      </nav>

      {/* User & Logout */}
      <div className="p-3 border-t border-surface-100 dark:border-surface-800">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 text-sm font-semibold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                {user.email}
              </p>
              <p className="text-[11px] text-surface-400 dark:text-surface-500 capitalize">
                {user.role || 'User'}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-danger-600 dark:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors"
        >
          <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
