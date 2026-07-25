import { useState, useEffect } from 'react';
import { promptsApi } from '../api/prompts';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import { PlusIcon, TrashIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import type { Prompt } from '../types/prompt';

export default function PromptLibraryPage() {
  const { addToast } = useToast();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', prompt_content: '', category: '' });

  useEffect(() => {
    promptsApi.list().then((res) => setPrompts(res.data)).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await promptsApi.create(form);
      setPrompts([res.data, ...prompts]);
      setShowCreate(false);
      setForm({ title: '', description: '', prompt_content: '', category: '' });
      addToast('Prompt created', 'success');
    } catch { addToast('Failed to create prompt', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await promptsApi.delete(id);
      setPrompts(prompts.filter((p) => p.id !== id));
      addToast('Prompt deleted', 'success');
    } catch { addToast('Failed to delete', 'error'); }
  };

  if (loading) return <div className="space-y-4">{ [1,2,3].map(i => <Skeleton key={i} className="h-28" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Prompt Library</h2>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Ready-made prompts for common test scenarios</p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="md">
          <PlusIcon className="w-4 h-4" /> New Prompt
        </Button>
      </div>

      {showCreate && (
        <Card>
          <form onSubmit={handleCreate} className="space-y-3">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" required
              className="input-base" />
            <input value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description"
              className="input-base" />
            <textarea value={form.prompt_content} onChange={(e) => setForm({ ...form, prompt_content: e.target.value })} placeholder="Prompt content" required rows={3}
              className="input-base resize-none" />
            <div className="flex gap-2">
              <Button type="submit" size="sm">Save</Button>
              <Button variant="secondary" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prompts.map((p) => (
          <Card key={p.id} hover>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/50">
                  <BookOpenIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-100">{p.title}</h3>
              </div>
              {p.category && <span className="badge-primary text-[11px]">{p.category}</span>}
            </div>
            {p.description && <p className="text-xs text-surface-500 dark:text-surface-400 mb-3">{p.description}</p>}
            <div className="rounded-xl bg-surface-50 dark:bg-surface-900 p-3 border border-surface-100 dark:border-surface-800 mb-3">
              <p className="text-xs text-surface-600 dark:text-surface-400 line-clamp-3 font-mono">{p.prompt_content}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-surface-400 dark:text-surface-500">{p.is_system ? 'System' : 'Custom'}</span>
              {!p.is_system && (
                <button onClick={() => handleDelete(p.id)} className="text-xs font-medium text-danger-600 dark:text-danger-500 hover:text-danger-700 transition-colors">
                  Delete
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
