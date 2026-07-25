import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useToast } from '../contexts/ToastContext';
import { scriptsApi } from '../api/scripts';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import type { ScriptOptions } from '../types/script';
import {
  ClipboardIcon, ArrowDownTrayIcon, BookmarkIcon,
  ArrowsPointingOutIcon, BookmarkSlashIcon,
} from '@heroicons/react/24/outline';

const FRAMEWORKS = [
  { value: 'selenium_java', label: 'Selenium Java' },
  { value: 'selenium_python', label: 'Selenium Python' },
  { value: 'playwright_js', label: 'Playwright JavaScript' },
  { value: 'playwright_ts', label: 'Playwright TypeScript' },
  { value: 'cypress', label: 'Cypress' },
  { value: 'robot_framework', label: 'Robot Framework' },
];

const BROWSERS = ['chrome', 'firefox', 'edge', 'safari'];
const DESIGN_PATTERNS = [
  { value: 'pom', label: 'Page Object Model' },
  { value: 'screenplay', label: 'Screenplay' },
  { value: 'keyword_driven', label: 'Keyword Driven' },
  { value: 'hybrid', label: 'Hybrid' },
];

const OPTION_LABELS: { key: keyof ScriptOptions; label: string }[] = [
  { key: 'assertions', label: 'Include Assertions' },
  { key: 'comments', label: 'Generate Comments' },
  { key: 'explicit_waits', label: 'Use Explicit Waits' },
  { key: 'error_handling', label: 'Error Handling' },
  { key: 'logging', label: 'Logging' },
  { key: 'screenshots', label: 'Screenshots' },
  { key: 'retry_logic', label: 'Retry Logic' },
  { key: 'generate_test_data', label: 'Generate Test Data' },
];

const EXT_MAP: Record<string, string> = {
  selenium_java: 'java', selenium_python: 'py', playwright_js: 'js',
  playwright_ts: 'ts', cypress: 'js', robot_framework: 'robot',
};

export default function GeneratorPage() {
  const { addToast } = useToast();
  const [testSteps, setTestSteps] = useState('');
  const [framework, setFramework] = useState('playwright_ts');
  const [browser, setBrowser] = useState('chrome');
  const [designPattern, setDesignPattern] = useState('pom');
  const [options, setOptions] = useState<ScriptOptions>({
    assertions: true, comments: true, explicit_waits: true,
    error_handling: true, logging: false, screenshots: false,
    retry_logic: false, generate_test_data: false,
  });
  const [generatedCode, setGeneratedCode] = useState('');
  const [currentScriptId, setCurrentScriptId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [language, setLanguage] = useState('typescript');
  const [advOptions, setAdvOptions] = useState<{
    temperature?: number; top_p?: number; max_tokens?: number;
    system_prompt?: string; custom_prompt?: string;
  }>({});

  const toggleOption = (key: keyof ScriptOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = async () => {
    if (!testSteps.trim()) { addToast('Please enter test steps', 'warning'); return; }
    setLoading(true);
    try {
      const res = await scriptsApi.generate({
        test_steps: testSteps,
        framework,
        browser,
        design_pattern: designPattern,
        options,
        ...advOptions,
      });
      setGeneratedCode(res.data.generated_code);
      setCurrentScriptId(res.data.id);
      setIsFavorite(res.data.is_favorite);
      setLanguage(EXT_MAP[framework] === 'ts' ? 'typescript' : EXT_MAP[framework] === 'py' ? 'python' : EXT_MAP[framework] === 'robot' ? 'robot' : 'javascript');
      addToast('Script generated!', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.detail || 'Generation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    addToast('Copied to clipboard', 'success');
  };

  const handleDownload = () => {
    const ext = EXT_MAP[framework] || 'txt';
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `test_script.${ext}`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleToggleFavorite = async () => {
    if (!currentScriptId) return;
    try {
      const res = await scriptsApi.toggleFavorite(currentScriptId);
      setIsFavorite(res.data.is_favorite);
      addToast(res.data.is_favorite ? 'Added to favorites' : 'Removed from favorites', 'success');
    } catch { addToast('Failed to update favorite', 'error'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Generate Automation Script</h2>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Enter test steps and generate production-ready automation code</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Test Steps</label>
              <textarea
                value={testSteps}
                onChange={(e) => setTestSteps(e.target.value)}
                placeholder={"Login\nSearch Product\nAdd Product\nCheckout\nLogout"}
                rows={6}
                className="input-base resize-none font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Framework', value: framework, set: setFramework, options: FRAMEWORKS },
                { label: 'Browser', value: browser, set: setBrowser, options: BROWSERS.map(b => ({ value: b, label: b.charAt(0).toUpperCase() + b.slice(1) })) },
                { label: 'Pattern', value: designPattern, set: setDesignPattern, options: DESIGN_PATTERNS },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">{field.label}</label>
                  <select value={field.value} onChange={(e) => field.set(e.target.value)}
                    className="w-full rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all duration-200">
                    {field.options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <details className="group border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden">
              <summary className="px-4 py-2.5 text-sm font-semibold text-primary-600 dark:text-primary-400 cursor-pointer bg-surface-50 dark:bg-surface-900/50 hover:bg-surface-100 dark:hover:bg-surface-800 select-none transition-colors">Advanced AI Options</summary>
              <div className="p-4 space-y-3 bg-white dark:bg-surface-900">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Temperature</label>
                    <input type="number" min={0} max={2} step={0.1} defaultValue={0.7}
                      className="w-full rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all"
                      onChange={(e) => setAdvOptions((p) => ({ ...p, temperature: parseFloat(e.target.value) || undefined }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Top P</label>
                    <input type="number" min={0} max={1} step={0.05} defaultValue={0.95}
                      className="w-full rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all"
                      onChange={(e) => setAdvOptions((p) => ({ ...p, top_p: parseFloat(e.target.value) || undefined }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Max Tokens</label>
                    <input type="number" min={100} max={16000} step={100} defaultValue={4096}
                      className="w-full rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all"
                      onChange={(e) => setAdvOptions((p) => ({ ...p, max_tokens: parseInt(e.target.value) || undefined }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">System Prompt Override</label>
                  <textarea rows={2} placeholder="Override the default system prompt..."
                    className="input-base resize-none text-xs"
                    onChange={(e) => setAdvOptions((p) => ({ ...p, system_prompt: e.target.value || undefined }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">Custom Prompt Template</label>
                  <textarea rows={2} placeholder="Customize the prompt sent to the AI..."
                    className="input-base resize-none text-xs"
                    onChange={(e) => setAdvOptions((p) => ({ ...p, custom_prompt: e.target.value || undefined }))}
                  />
                </div>
              </div>
            </details>

            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Options</label>
              <div className="grid grid-cols-2 gap-2">
                {OPTION_LABELS.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2.5 cursor-pointer text-sm text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 transition-colors">
                    <input type="checkbox" checked={options[key]} onChange={() => toggleOption(key)}
                      className="w-4 h-4 rounded border-surface-300 dark:border-surface-700 text-primary-600 focus:ring-primary-500/30" />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <Button onClick={handleGenerate} loading={loading} className="w-full" size="lg">
              {loading ? 'Generating...' : 'Generate Script'}
            </Button>

            {loading && (
              <p className="text-center text-sm text-primary-600 dark:text-primary-400 font-medium typing-cursor">
                AI is crafting your automation script...
              </p>
            )}
          </div>
        </Card>

        <div className={isFullscreen ? 'fixed inset-0 z-50 bg-surface-50 dark:bg-surface-950 p-6' : ''}>
          {isFullscreen && (
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-surface-900 dark:text-white">Generated Script</h3>
              <Button variant="ghost" onClick={() => setIsFullscreen(false)}>Exit Fullscreen</Button>
            </div>
          )}
          <Card className={`${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[500px]'} flex flex-col`} padding="none">
            <div className="flex items-center justify-between px-5 py-3 border-b border-surface-100 dark:border-surface-800">
              <span className="text-sm font-semibold text-surface-500 dark:text-surface-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success-500" />
                Output
              </span>
              <div className="flex items-center gap-1">
                <button onClick={handleCopy} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 hover:text-surface-900 dark:hover:text-surface-200 transition-colors" title="Copy">
                  <ClipboardIcon className="w-4 h-4" />
                </button>
                <button onClick={handleDownload} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 hover:text-surface-900 dark:hover:text-surface-200 transition-colors" title="Download">
                  <ArrowDownTrayIcon className="w-4 h-4" />
                </button>
                <button onClick={handleToggleFavorite} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" title="Favorite">
                  {isFavorite ? <BookmarkSlashIcon className="w-4 h-4 text-warning-500" /> : <BookmarkIcon className="w-4 h-4 text-surface-500 hover:text-surface-900 dark:hover:text-surface-200" />}
                </button>
                <button onClick={() => setIsFullscreen(true)} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 hover:text-surface-900 dark:hover:text-surface-200 transition-colors" title="Fullscreen">
                  <ArrowsPointingOutIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden rounded-b-2xl">
              <Editor
                height="100%"
                language={language}
                value={generatedCode || '// Generated script will appear here...'}
                theme="vs-dark"
                options={{ readOnly: false, minimap: { enabled: false }, fontSize: 13, lineNumbers: 'on', scrollBeyondLastLine: false, wordWrap: 'on', padding: { top: 12 } }}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
