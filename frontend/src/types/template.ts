export interface Template {
  id: string;
  title: string;
  description: string | null;
  domain: string | null;
  framework: string | null;
  template_content: string;
  is_system: boolean;
  created_at: string;
}
