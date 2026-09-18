import type { TranslationOverrides } from '../locales/types';
import type { OrfinErrorCode } from './errors';

export type JsonSchema = Record<string, unknown>;
export type ThemePreset =
  | 'cloud'
  | 'iris'
  | 'lagoon'
  | 'sand'
  | 'rose'
  | 'midnight'
  | 'graphite'
  | 'forest'
  | 'plum'
  | 'espresso';
export type Theme = ThemePreset | 'none';
export interface AssistantLogo {
  src: string;
  alt?: string;
}
export type BuiltInLocale =
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt'
  | 'it'
  | 'nl'
  | 'pl'
  | 'uk'
  | 'ru'
  | 'tr'
  | 'ar'
  | 'hi'
  | 'zh'
  | 'ja'
  | 'ko';
export type Locale = BuiltInLocale | (string & {});

export interface Section {
  id: string;
  title: string;
  description: string;
  path?: string;
  prompt?: string;
  tourOrder?: number;
  translations?: Record<string, Partial<Pick<Section, 'title' | 'description'>>>;
}

export interface Features {
  chat: boolean;
  tour: boolean;
  sectionPicker: boolean;
  hoverHelp: boolean;
  navigation: boolean;
  tools: boolean;
  pageContext: 'sections' | 'page';
}

export interface MemoryOptions {
  storage: 'local' | 'session' | 'none';
  rememberVisited: boolean;
  rememberDismissed: boolean;
  ttlMs: number;
  key: string;
}

export interface AssistantSettings {
  features: Features;
  memory: MemoryOptions;
  hoverDelay: number;
  hoverCooldown: number;
  highlightDuration: number;
  highlightOpacity: number;
  highlightTransition: number;
  logo: AssistantLogo | null;
  theme: Theme;
  styles: string;
  locale: Locale;
  translations: TranslationOverrides;
}

export type SettingsInput = Partial<Omit<AssistantSettings, 'features' | 'memory'>> & {
  features?: Partial<Features>;
  memory?: Partial<MemoryOptions>;
};

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  locale?: Locale;
  sources?: Source[];
  tools?: ToolActivity[];
  status?: 'streaming' | 'complete' | 'cancelled' | 'error';
}

export interface Source {
  id: string;
  title: string;
  content: string;
  url?: string;
  score?: number;
}

export interface ToolActivity {
  id: string;
  name: string;
  status: 'running' | 'complete' | 'error';
}

export interface PageContext {
  url: string;
  title: string;
  sections: Section[];
  selectedSectionId?: string;
  text?: string;
}

export interface ChatRequest {
  messages: Pick<ChatMessage, 'role' | 'content'>[];
  page: PageContext;
  features: Features;
  locale: Locale;
}

export type BrowserAction =
  | { type: 'highlight'; sectionId: string }
  | { type: 'navigate'; path: string; sectionId?: string }
  | { type: 'tour' }
  | { type: 'custom'; name: string; payload: Record<string, unknown> };

export type AgentEvent =
  | { type: 'delta'; text: string }
  | { type: 'sources'; sources: Source[] }
  | { type: 'tool'; tool: ToolActivity }
  | { type: 'action'; action: BrowserAction }
  | { type: 'error'; message: string; code?: OrfinErrorCode }
  | { type: 'done' };

export interface ChatTransport {
  stream(request: ChatRequest, signal: AbortSignal): AsyncIterable<AgentEvent>;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: string;
}

export interface ModelMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
  toolCallId?: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: JsonSchema;
}

export interface ProviderRequest {
  messages: ModelMessage[];
  tools: ToolDefinition[];
  signal: AbortSignal;
}

export type ProviderEvent = { type: 'delta'; text: string } | { type: 'tool_call'; call: ToolCall };

export interface ModelProvider {
  stream(request: ProviderRequest): AsyncIterable<ProviderEvent>;
}

export interface ToolContext {
  signal: AbortSignal;
  request: ChatRequest;
  identity?: unknown;
  emitAction?: (action: BrowserAction) => void;
}

export interface Tool extends ToolDefinition {
  execute(arguments_: Record<string, unknown>, context: ToolContext): Promise<unknown> | unknown;
}

export interface Retriever {
  retrieve(query: string, context: ToolContext): Promise<Source[]>;
}

export interface AgentOptions {
  provider: ModelProvider;
  context: string;
  systemPrompt?: string;
  sections?: Section[];
  tools?: Tool[];
  retriever?: Retriever;
  features?: Partial<Features>;
  maxToolRounds?: number;
  maxOutputCharacters?: number;
  allowedPaths?: string[];
}
