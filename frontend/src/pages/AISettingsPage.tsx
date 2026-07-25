import { useState, useEffect } from 'react';
import { settingsApi, type AISettings } from '../api/settings';
import { useToast } from '../contexts/ToastContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { Cog6ToothIcon, KeyIcon, BeakerIcon } from '@heroicons/react/24/outline';

const PROVIDERS = [
  { key: 'groq', label: 'Groq', model: 'llama-3.3-70b-versatile', color: 'from-orange-500 to-red-500' },
  { key: 'openai', label: 'OpenAI', model: 'gpt-4o', color: 'from-emerald-500 to-teal-500' },
  { key: 'gemini', label: 'Gemini', model: 'gemini-2.0-flash', color: 'from-blue-500 to-purple-500' },
];

export default function AISettingsPage() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    settingsApi.getAI().then((res) => setSettings(res.data)).finally(() => setLoading(false));
  }, []);

  const handleSaveKey = async (provider: string) => {
    const key = apiKeys[provider];
    if (!key) { addToast('Enter an API key', 'warning'); return; }
    setSaving(provider);
    try {
      await settingsApi.setApiKey(provider, key);
      setApiKeys({ ...apiKeys, [provider]: '' });
      addToast(`API key for ${provider} saved`, 'success');
      const res = await settingsApi.getAI();
      setSettings(res.data);
    } catch { addToast('Failed to save API key', 'error'); }
    finally { setSaving(null); }
  };

  const handleDeleteKey = async (provider: string) => {
    try {
      await settingsApi.deleteApiKey(provider);
      addToast(`API key for ${provider} removed`, 'success');
      const res = await settingsApi.getAI();
      setSettings(res.data);
    } catch { addToast('Failed to remove', 'error'); }
  };

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32" />)}</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white">AI Settings</h2>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Configure AI providers and API keys</p>
      </div>

      <Card>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50">
            <Cog6ToothIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 dark:text-white">Default Provider</h3>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
              Currently using <span className="font-semibold text-surface-700 dark:text-surface-300 capitalize">{settings?.default_provider}</span>
            </p>
            <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">Change via environment variable <code className="text-primary-600 dark:text-primary-400">DEFAULT_AI_PROVIDER</code></p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PROVIDERS.map((prov) => {
          const configured = settings?.configured_providers.includes(prov.key);
          return (
            <Card key={prov.key} hover={!configured}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br ${prov.color} opacity-90`}>
                  <KeyIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-surface-900 dark:text-white">{prov.label}</h3>
                  <p className="text-[11px] text-surface-500 dark:text-surface-400">{prov.model}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`badge ${configured ? 'badge-success' : 'px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-surface-100 dark:bg-surface-800 text-surface-500'}`}>
                  {configured ? 'Configured' : 'Not set'}
                </span>
              </div>
              <div className="space-y-2">
                <input
                  type="password"
                  value={apiKeys[prov.key] || ''}
                  onChange={(e) => setApiKeys({ ...apiKeys, [prov.key]: e.target.value })}
                  placeholder={configured ? '•••••••• (set new key)' : 'Enter API key'}
                  className="input-base text-xs"
                />
                <div className="flex gap-2">
                  <Button size="sm" loading={saving === prov.key} onClick={() => handleSaveKey(prov.key)} className="flex-1">
                    Save
                  </Button>
                  {configured && (
                    <Button size="sm" variant="danger" onClick={() => handleDeleteKey(prov.key)}>Remove</Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-950/50">
            <BeakerIcon className="w-5 h-5 text-accent-600 dark:text-accent-400" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 dark:text-white">Advanced Options</h3>
            <p className="text-sm text-surface-500 dark:text-surface-400">Set per-generation in the Script Generator</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Temperature', value: '0.7', range: '0–2' },
            { label: 'Top P', value: '0.95', range: '0–1' },
            { label: 'Max Tokens', value: '4096', range: '100–16000' },
          ].map(item => (
            <div key={item.label} className="p-4 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-100 dark:border-surface-800">
              <p className="text-xs text-surface-500 dark:text-surface-400 mb-1">{item.label}</p>
              <p className="text-lg font-bold text-surface-900 dark:text-white">{item.value}</p>
              <p className="text-[11px] text-surface-400 dark:text-surface-500">Range: {item.range}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
