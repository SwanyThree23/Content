import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  provider?: 'anthropic' | 'openai' | 'openrouter';
  model?: string;
}

export class MasterAIService {
  private anthropic: Anthropic;
  private openai: OpenAI;
  private openrouter: OpenAI;

  constructor() {
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.openrouter = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1'
    });
  }

  async chat(messages: Message[], options: ChatOptions = {}) {
    const { provider = 'anthropic', model } = options;

    if (provider === 'anthropic') {
      const response = await this.anthropic.messages.create({
        model: model || 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: messages.map(m => ({ role: m.role, content: m.content }))
      });
      return {
        content: (response.content[0] as any).text,
        provider: 'anthropic',
        model: response.model,
        usage: response.usage
      };
    }

    if (provider === 'openrouter') {
      const response = await this.openrouter.chat.completions.create({
        model: model || 'anthropic/claude-sonnet-4-6',
        messages
      });
      return {
        content: response.choices[0].message.content,
        provider: 'openrouter',
        model: response.model,
        usage: response.usage
      };
    }

    // Default: OpenAI
    const response = await this.openai.chat.completions.create({
      model: model || 'gpt-4o',
      messages
    });
    return {
      content: response.choices[0].message.content,
      provider: 'openai',
      model: response.model,
      usage: response.usage
    };
  }

  async streamChat(messages: Message[], onChunk: (text: string) => void, options: ChatOptions = {}) {
    const { provider = 'anthropic', model } = options;

    if (provider === 'anthropic') {
      const stream = await this.anthropic.messages.create({
        model: model || 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream: true
      });

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          onChunk(event.delta.text);
        }
      }
      return;
    }

    // OpenAI / OpenRouter streaming
    const client = provider === 'openrouter' ? this.openrouter : this.openai;
    const stream = await client.chat.completions.create({
      model: model || 'gpt-4o',
      messages,
      stream: true
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) onChunk(text);
    }
  }
}
