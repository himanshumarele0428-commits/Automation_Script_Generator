export interface ScriptOptions {
  assertions: boolean;
  comments: boolean;
  explicit_waits: boolean;
  error_handling: boolean;
  logging: boolean;
  screenshots: boolean;
  retry_logic: boolean;
  generate_test_data: boolean;
}

export interface GenerateRequest {
  test_steps: string;
  framework: string;
  browser: string;
  design_pattern: string;
  options: ScriptOptions;
  ai_provider?: string;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  system_prompt?: string;
  custom_prompt?: string;
}

export interface Script {
  id: string;
  prompt_text: string;
  generated_code: string;
  framework: string;
  browser: string;
  design_pattern: string;
  language: string;
  options: ScriptOptions | null;
  ai_model: string | null;
  ai_provider: string | null;
  execution_time_ms: number | null;
  is_favorite: boolean;
  created_at: string;
}

export interface ScriptListItem {
  id: string;
  prompt_text: string;
  framework: string;
  language: string;
  ai_provider: string | null;
  is_favorite: boolean;
  created_at: string;
}

export interface HistoryResponse {
  items: ScriptListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface DashboardStats {
  total_scripts: number;
  today_scripts: number;
  favorite_scripts: number;
  framework_usage: Record<string, number>;
  language_usage: Record<string, number>;
  recent_activity: ScriptListItem[];
}
