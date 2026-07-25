import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { scriptsApi } from '../api/scripts';
import { useToast } from '../contexts/ToastContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { TrashIcon, BookmarkIcon, EyeIcon, ArrowDownTrayIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { ScriptListItem } from '../types/script';

const FRAMEWORKS = ['', 'selenium_java', 'selenium_python', 'playwright_js', 'playwright_ts', 'cypress', 'robot_framework'];

export default function HistoryPage() {
  const { addToast } = useToast();
  const [items, setItems] = useState<ScriptListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [frameworkFilter, setFrameworkFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = { page, page_size: 10 };
      if (search) params.search = search;
      if (frameworkFilter) params.framework = frameworkFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const res = await scriptsApi.list(params);
      setItems(res.data.items);
      setTotal(res.data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, [page, frameworkFilter]);

  const handleDelete = async (id: string) => {
    try { await scriptsApi.delete(id); addToast('Script deleted', 'success'); fetchHistory(); }
    catch { addToast('Failed to delete', 'error'); }
  };

  const handleToggleFav = async (id: string) => {
    try { await scriptsApi.toggleFavorite(id); fetchHistory(); }
    catch { addToast('Failed to update', 'error'); }
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchHistory(); };

  const handleExport = async (format: 'csv' | 'excel') => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/scripts/export/${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scripts_export.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast(`Exported as ${format.toUpperCase()}`, 'success');
    } catch {
      addToast('Export failed', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white">History</h2>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Browse and search your generated scripts</p>
      </div>

      <Card>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search scripts..."
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400"
                />
              </div>
              <Button type="submit" size="sm">Search</Button>
            </form>
            <select value={frameworkFilter} onChange={(e) => { setFrameworkFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/30 outline-none">
              {FRAMEWORKS.map(f => <option key={f} value={f}>{f ? f.replace(/_/g, ' ') : 'All Frameworks'}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-surface-500">From:</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500/30 outline-none" />
              <label className="text-xs font-medium text-surface-500">To:</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500/30 outline-none" />
              <Button size="sm" variant="secondary" onClick={() => { setPage(1); fetchHistory(); }}>Apply</Button>
            </div>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="outline" onClick={() => handleExport('csv')}>
                <ArrowDownTrayIcon className="w-4 h-4" /> CSV
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleExport('excel')}>
                <ArrowDownTrayIcon className="w-4 h-4" /> Excel
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card padding="none">
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-surface-400 dark:text-surface-500 text-sm">No scripts found</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-surface-100 dark:divide-surface-800">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">{item.prompt_text}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{item.framework.replace(/_/g, ' ')} &middot; {item.language} &middot; {new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Link to={`/generate?id=${item.id}`} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors" title="View">
                      <EyeIcon className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleToggleFav(item.id)} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" title="Favorite">
                      <BookmarkIcon className={`w-4 h-4 ${item.is_favorite ? 'text-warning-500 fill-warning-500' : 'text-surface-400 hover:text-surface-600 dark:hover:text-surface-300'}`} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 rounded-xl hover:bg-danger-50 dark:hover:bg-danger-500/10 text-surface-400 hover:text-danger-600 dark:hover:text-danger-400 transition-colors" title="Delete">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {total > 10 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50 rounded-b-2xl">
                <span className="text-sm text-surface-500">Page {page} of {Math.ceil(total / 10)}</span>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                  <Button variant="secondary" size="sm" disabled={page >= Math.ceil(total / 10)} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
