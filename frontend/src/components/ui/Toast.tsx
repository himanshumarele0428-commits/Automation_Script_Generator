import { useToast } from '../../contexts/ToastContext';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const typeStyles: Record<string, { bg: string; border: string; text: string; icon: any }> = {
  success: {
    bg: 'bg-success-50 dark:bg-success-50/10',
    border: 'border-success-200 dark:border-success-500/20',
    text: 'text-success-700 dark:text-success-400',
    icon: CheckCircleIcon,
  },
  error: {
    bg: 'bg-danger-50 dark:bg-danger-50/10',
    border: 'border-danger-200 dark:border-danger-500/20',
    text: 'text-danger-700 dark:text-danger-400',
    icon: XCircleIcon,
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-warning-50/10',
    border: 'border-warning-200 dark:border-warning-500/20',
    text: 'text-warning-700 dark:text-warning-400',
    icon: ExclamationTriangleIcon,
  },
  info: {
    bg: 'bg-primary-50 dark:bg-primary-50/10',
    border: 'border-primary-200 dark:border-primary-500/20',
    text: 'text-primary-700 dark:text-primary-400',
    icon: InformationCircleIcon,
  },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => {
        const style = typeStyles[t.type];
        const Icon = style.icon;
        return (
          <div
            key={t.id}
            className={`toast-enter rounded-xl border px-4 py-3 shadow-card-lg flex items-center gap-3 min-w-[320px] backdrop-blur-xl ${style.bg} ${style.border} ${style.text}`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="flex-1 text-sm font-medium">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors opacity-60 hover:opacity-100"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
