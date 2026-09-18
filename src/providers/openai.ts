import { readSSE } from '../core/sse';
import type {
  ModelMessage,
  ModelProvider,
  ProviderEvent,
  ToolCall,
  ToolDefinition,
} from '../core/types';

export interface OpenAICompatibleOptions {
  baseURL: string;
  model: string;
  apiKey?: string;
  headers?: HeadersInit;
  toolMode?: 'native' | 'prompt' | 'none';
  parameters?: Record<string, unknown>;
  fetch?: typeof globalThis.fetch;
}

function promptMessages(messages: ModelMessage[], tools: ToolDefinition[]) {
  const instruction = tools.length
    ? `Available tools: ${JSON.stringify(tools)}. To call a tool, your ENTIRE response must be <orfin-tool>{"name":"tool_name","arguments":{}}</orfin-tool>. No markdown, preamble or other text in a tool call. Call at most one tool per response. After receiving the result, answer the user or call the next tool. Use a tool when the user asks to show, open, highlight, or retrieve live data. Never say you performed an action without calling its tool.`
    : '';
  return messages.map((message) => {
    if (message.role === 'system')
      return { role: 'system', content: `${instruction}\n${message.content}` };
    if (message.role === 'tool')
      return { role: 'user', content: `Tool result (${message.toolCallId}): ${message.content}` };
    if (message.toolCalls?.length) {
      const call = message.toolCalls[0]!;
      return {
        role: 'assistant',
        content: `<orfin-tool>${JSON.stringify({ name: call.name, arguments: JSON.parse(call.arguments) })}</orfin-tool>`,
      };
    }
    return { role: message.role, content: message.content };
  });
}

export function createOpenAICompatible(options: OpenAICompatibleOptions): ModelProvider {
  const toolMode = options.toolMode ?? 'native';
  return {
    async *stream({ messages, tools, signal }) {
      const headers = new Headers(options.headers);
      headers.set('Content-Type', 'application/json');
      if (options.apiKey) headers.set('Authorization', `Bearer ${options.apiKey}`);
      const body = {
        ...options.parameters,
        model: options.model,
        stream: true,
        messages:
          toolMode === 'prompt'
            ? promptMessages(messages, tools)
            : messages.map((message) => ({
                role: message.role,
                content: message.content || null,
                ...(message.toolCallId ? { tool_call_id: message.toolCallId } : {}),
                ...(message.toolCalls
                  ? {
                      tool_calls: message.toolCalls.map((call) => ({
                        id: call.id,
                        type: 'function',
                        function: { name: call.name, arguments: call.arguments },
                      })),
                    }
                  : {}),
              })),
        ...(toolMode === 'native' && tools.length
          ? {
              tools: tools.map((tool) => ({ type: 'function', function: tool })),
              tool_choice: 'auto',
            }
          : {}),
      };
      const response = await (options.fetch ?? fetch)(
        `${options.baseURL.replace(/\/$/, '')}/chat/completions`,
        { method: 'POST', headers, body: JSON.stringify(body), signal },
      );
      if (!response.ok) throw new Error(`Model provider returned HTTP ${response.status}.`);
      if (!response.body) throw new Error('Model provider returned an empty response.');
      const calls = new Map<number, ToolCall>();
      let pending = '';
      let mode: 'unknown' | 'text' | 'tool' = toolMode === 'prompt' ? 'unknown' : 'text';
      let finished = false;
      for await (const frame of readSSE(response.body, signal)) {
        if (frame.data === '[DONE]') {
          finished = true;
          break;
        }
        const chunk = JSON.parse(frame.data) as {
          error?: unknown;
          choices?: {
            finish_reason?: string | null;
            delta?: {
              content?: string;
              tool_calls?: {
                index: number;
                id?: string;
                function?: { name?: string; arguments?: string };
              }[];
            };
          }[];
        };
        if (chunk.error) throw new Error('Model provider reported a streaming error.');
        const choice = chunk.choices?.[0];
        if (choice?.finish_reason) finished = true;
        for (const part of choice?.delta?.tool_calls ?? []) {
          const call = calls.get(part.index) ?? { id: '', name: '', arguments: '' };
          call.id += part.id ?? '';
          call.name += part.function?.name ?? '';
          call.arguments += part.function?.arguments ?? '';
          if (call.arguments.length > 32768 || calls.size > 16)
            throw new Error('Tool call exceeds the size limit.');
          calls.set(part.index, call);
        }
        const text = choice?.delta?.content;
        if (!text) continue;
        if (mode === 'text') {
          yield { type: 'delta', text };
          continue;
        }
        pending += text;
        const trimmed = pending.trimStart();
        if (trimmed.startsWith('<orfin-tool>')) mode = 'tool';
        else if (!'<orfin-tool>'.startsWith(trimmed)) {
          mode = 'text';
          yield { type: 'delta', text: pending };
          pending = '';
        }
        if (pending.length > 32768) throw new Error('Tool response exceeds the size limit.');
      }
      if (!finished) throw new Error('Model stream ended unexpectedly.');
      if (mode === 'tool') {
        const match = /^\s*<orfin-tool>([\s\S]*?)<\/orfin-tool>\s*$/.exec(pending);
        if (!match) throw new Error('The model returned an incomplete tool call.');
        const parsed = JSON.parse(match[1]!) as {
          name: string;
          arguments: Record<string, unknown>;
        };
        if (
          typeof parsed.name !== 'string' ||
          !parsed.arguments ||
          typeof parsed.arguments !== 'object' ||
          Array.isArray(parsed.arguments)
        )
          throw new Error('The model returned an invalid tool call.');
        yield {
          type: 'tool_call',
          call: {
            id: crypto.randomUUID(),
            name: parsed.name,
            arguments: JSON.stringify(parsed.arguments),
          },
        };
      } else if (pending) yield { type: 'delta', text: pending };
      for (const call of calls.values()) {
        if (!call.id || !call.name) throw new Error('The model returned an incomplete tool call.');
        yield { type: 'tool_call', call } satisfies ProviderEvent;
      }
    },
  };
}
