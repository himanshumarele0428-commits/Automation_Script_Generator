import { useState, useEffect } from 'react';
import { scriptsApi } from '../api/scripts';
import { useToast } from '../contexts/ToastContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { BookmarkSlashIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import type { ScriptListItem } from '../types/script';

export default function SavedScriptsPage() {
  const { addToast } = useToast();
  const [items, setItems] = useState<ScriptListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await scriptsApi.list({ favorite_only: true, page_size: 50 });
      setItems(res.data.items);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchFavorites(); }, []);

  const handleUnfavorite = async (id: string) => {
    try {
      await scriptsApi.toggleFavorite(id);
      setItems(items.filter((i) => i.id !== id));
      addToast('Removed from favorites', 'success');
    } catch { addToast('Failed', 'error'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Saved Scripts</h2>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Your favorite scripts for quick access</p>
      </div>

      <Card padding="none">
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 mx-auto mb-4">
              <BookmarkSlashIcon className="w-8 h-8 text-surface-400" />
            </div>
            <p className="text-surface-500 dark:text-surface-400 text-sm">No saved scripts yet</p>
            <p className="text-surface-400 dark:text-surface-500 text-xs mt-1">Mark scripts as favorite to see them here</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-warning-50 dark:bg-warning-500/10 shrink-0">
                    <CodeBracketIcon className="w-4 h-4 text-warning-600 dark:text-warning-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">{item.prompt_text}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">{item.framework.replace(/_/g, ' ')} &middot; {item.language}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnfavorite(item.id)}
                  className="p-2 rounded-xl hover:bg-warning-50 dark:hover:bg-warning-500/10 text-warning-500 transition-colors ml-4"
                  title="Remove from favorites"
                >
                  <BookmarkSlashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
