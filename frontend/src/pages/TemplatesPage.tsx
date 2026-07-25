import { useState, useEffect } from 'react';
import { templatesApi } from '../api/templates';
import { useToast } from '../contexts/ToastContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import {
  DocumentTextIcon, CodeBracketIcon, XMarkIcon,
  ClipboardIcon, BeakerIcon, ClockIcon,
} from '@heroicons/react/24/outline';
import type { Template } from '../types/template';

const DOMAIN_COLORS: Record<string, string> = {
  ecommerce: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  banking: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  healthcare: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  crm: 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  travel: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  education: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
};

const DOMAIN_ICONS: Record<string, any> = {
  ecommerce: 'ShoppingBagIcon',
  banking: 'BanknotesIcon',
  healthcare: 'HeartIcon',
  crm: 'UserGroupIcon',
  travel: 'GlobeAltIcon',
  education: 'AcademicCapIcon',
};

function getTcCount(code: string): number {
  const matches = code.match(/test\('TC\d+/g);
  return matches ? matches.length : 0;
}

function getFirstCodePreview(code: string, lines = 6): string {
  return code.split('\n').slice(0, lines).join('\n');
}

export default function TemplatesPage() {
  const { addToast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Template | null>(null);

  useEffect(() => {
    templatesApi.list().then((res) => setTemplates(res.data)).finally(() => setLoading(false));
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    addToast('Template code copied!', 'success');
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-56" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Script Templates</h2>
        <p className="text-surface-500 dark:text-surface-400 mt-1">
          Production-ready automation templates by domain — {templates.length} templates available
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((t) => {
          const tcCount = getTcCount(t.template_content);
          const preview = getFirstCodePreview(t.template_content);
          const domainClass = DOMAIN_COLORS[t.domain] || 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 border-surface-200 dark:border-surface-700';

          return (
            <Card key={t.id} hover padding="none">
              {/* Header */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/50">
                      <DocumentTextIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-surface-900 dark:text-white leading-tight">
                        {t.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${domainClass}`}>
                          {t.domain}
                        </span>
                        {t.framework && (
                          <span className="text-[10px] text-surface-400 dark:text-surface-500 font-medium uppercase">
                            {t.framework.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {t.description && (
                  <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed mb-3">{t.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-surface-400 dark:text-surface-500">
                  <span className="flex items-center gap-1.5">
                    <BeakerIcon className="w-3.5 h-3.5" />
                    {tcCount} test cases
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CodeBracketIcon className="w-3.5 h-3.5" />
                    {t.template_content.split('\n').length} lines
                  </span>
                </div>
              </div>

              {/* Code Preview */}
              <div
                className="mx-3 mb-0 rounded-lg bg-surface-50 dark:bg-surface-950 border border-surface-100 dark:border-surface-800 p-3 font-mono text-xs text-surface-600 dark:text-surface-400 leading-relaxed overflow-hidden cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                onClick={() => setSelected(t)}
              >
                <pre className="whitespace-pre-wrap">{preview}</pre>
                <div className="text-center text-[10px] text-surface-400 dark:text-surface-500 mt-2 font-sans font-medium">
                  Click to view full template &rarr;
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 py-3 flex items-center gap-2 border-t border-surface-100 dark:border-surface-800 mt-3">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setSelected(t)}>
                  View Full Code
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleCopy(t.template_content)} className="flex-shrink-0">
                  <ClipboardIcon className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div
            className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-card-lg w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 dark:border-surface-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50">
                  <DocumentTextIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900 dark:text-white">{selected.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="badge-primary text-[10px]">{selected.domain}</span>
                    {selected.framework && <span className="text-[10px] text-surface-500 font-medium uppercase">{selected.framework.replace(/_/g, ' ')}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => handleCopy(selected.template_content)}>
                  <ClipboardIcon className="w-4 h-4" /> Copy
                </Button>
                <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400">
                  <BeakerIcon className="w-4 h-4 text-primary-500" />
                  <span className="font-semibold">{getTcCount(selected.template_content)}</span> test cases
                </div>
                <div className="flex items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400">
                  <CodeBracketIcon className="w-4 h-4 text-accent-500" />
                  <span className="font-semibold">{selected.template_content.split('\n').length}</span> lines
                </div>
                <div className="flex items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400">
                  <ClockIcon className="w-4 h-4 text-warning-500" />
                  Playwright TypeScript
                </div>
              </div>
              {selected.description && (
                <p className="text-sm text-surface-600 dark:text-surface-400 mb-4 leading-relaxed bg-surface-50 dark:bg-surface-950 rounded-xl p-4 border border-surface-100 dark:border-surface-800">
                  {selected.description}
                </p>
              )}
              <div className="rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 overflow-hidden">
                <pre className="p-5 font-mono text-xs text-surface-700 dark:text-surface-300 leading-relaxed whitespace-pre overflow-x-auto max-h-[50vh] scrollbar-hide">
                  {selected.template_content}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
