import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { content, provider = 'openai', model = 'gpt-4o', apiKey } = await req.json();

  // Create provider with user's API key (BYOK)
  const aiProvider = provider === 'openai'
    ? createOpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY })
    : createAnthropic({ apiKey: apiKey || process.env.ANTHROPIC_API_KEY });

  const modelName = provider === 'openai' && model === 'gpt-4o' ? 'gpt-4o' :
    provider === 'openai' && model === 'gpt-4o-mini' ? 'gpt-4o-mini' :
    provider === 'anthropic' && model === 'claude-3-5-sonnet' ? 'claude-3-5-sonnet-20241022' :
    provider === 'anthropic' && model === 'claude-3-5-haiku' ? 'claude-3-5-haiku-20250107' :
    model;

  const prompt = `Structure the following content into a mindmap format. Return ONLY valid JSON in this format:
{
  "root": {
    "text": "Main Topic",
    "children": [
      {
        "text": "Subtopic 1",
        "children": []
      }
    ]
  }
}

Content to structure:
${content}`;

  const result = streamText({
    model: aiProvider(modelName),
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  return result.toDataStreamResponse();
}
