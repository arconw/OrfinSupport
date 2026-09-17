import { readSSE } from '../core/sse';
import type { ModelProvider, ToolCall } from '../core/types';

export interface AnthropicOptions {
  apiKey: string;
  model: string;
  baseURL?: string;
  maxTokens?: number;
  fetch?: typeof globalThis.fetch;
}

export function createAnthropic(options: AnthropicOptions): ModelProvider {
  return {
    async *stream({ messages, tools, signal }) {
      const response = await (options.fetch ?? fetch)(
        `${(options.baseURL ?? 'https://api.anthropic.com/v1').replace(/\/$/, '')}/messages`,
        {
          method: 'POST',
          signal,
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': options.apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: options.model,
            max_tokens: options.maxTokens ?? 2048,
            stream: true,
            system: messages
              .filter((message) => message.role === 'system')
              .map((message) => message.content)
              .join('\n'),
            messages: messages
              .filter((message) => message.role !== 'system')
              .map((message) => {
                if (message.role === 'tool')
                  return {
                    role: 'user',
                    content: [
                      {
                        type: 'tool_result',
                        tool_use_id: message.toolCallId,
                        content: message.content,
                      },
                    ],
                  };
                if (message.toolCalls)
                  return {
                    role: 'assistant',
                    content: [
                      ...(message.content ? [{ type: 'text', text: message.content }] : []),
                      ...message.toolCalls.map((call) => ({
                        type: 'tool_use',
                        id: call.id,
                        name: call.name,
                        input: JSON.parse(call.arguments),
                      })),
                    ],
                  };
                return { role: message.role, content: message.content };
              }),
            ...(tools.length
              ? {
                  tools: tools.map((tool) => ({
                    name: tool.name,
                    description: tool.description,
                    input_schema: tool.parameters,
                  })),
                }
              : {}),
          }),
        },
      );
      if (!response.ok || !response.body)
        throw new Error(`Model provider returned HTTP ${response.status}.`);
      const calls = new Map<number, ToolCall>();
      let completed = false;
      for await (const frame of readSSE(response.body, signal)) {
        const event = JSON.parse(frame.data) as {
          type: string;
          index?: number;
          content_block?: { type: string; id: string; name: string };
          delta?: { type: string; text?: string; partial_json?: string };
        };
        if (event.type === 'error') throw new Error('Model provider reported a streaming error.');
        if (event.type === 'message_stop') completed = true;
        if (event.type === 'content_block_start' && event.content_block?.type === 'tool_use')
          calls.set(event.index!, {
            id: event.content_block.id,
            name: event.content_block.name,
            arguments: '',
          });
        if (event.delta?.type === 'text_delta' && event.delta.text)
          yield { type: 'delta', text: event.delta.text };
        if (event.delta?.type === 'input_json_delta') {
          const call = calls.get(event.index!);
          if (call) {
            call.arguments += event.delta.partial_json ?? '';
            if (call.arguments.length > 32768) throw new Error('Tool call exceeds the size limit.');
          }
        }
      }
      if (!completed) throw new Error('Model stream ended unexpectedly.');
      for (const call of calls.values())
        yield { type: 'tool_call', call: { ...call, arguments: call.arguments || '{}' } };
    },
  };
}
