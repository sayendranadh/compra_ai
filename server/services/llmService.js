import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY;
const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest';
const client = apiKey ? new Anthropic({ apiKey }) : null;

export async function callLLM(systemPrompt, history, userMessage) {
  if (!client) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      ...normalizeHistory(history),
      { role: 'user', content: userMessage }
    ]
  });

  const text = response.content?.find((part) => part.type === 'text')?.text || response.content?.[0]?.text;
  if (!text) throw new Error('LLM returned no text content');

  return JSON.parse(stripJsonFences(text));
}

function normalizeHistory(history = []) {
  return history
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message) => ({
      role: message.role,
      content: String(message.content || '')
    }));
}

function stripJsonFences(text) {
  return text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '');
}

