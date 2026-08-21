import { OpenRouter } from '@openrouter/sdk';
import type { ChatStreamChunk } from '@openrouter/sdk/models';

const MODEL = process.env.OPENROUTER_MODEL ?? 'nvidia/nemotron-3.5-lightning:free';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages?: ChatMessage[] };

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: 'A non-empty messages array is required.' }, { status: 400 });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return Response.json({ error: 'OPENROUTER_API_KEY is not set.' }, { status: 500 });
  }

  const openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  let stream: AsyncIterable<ChatStreamChunk>;
  try {
    stream = (await openrouter.chat.send({
      chatRequest: {
        model: MODEL,
        messages,
        stream: true,
      },
    })) as AsyncIterable<ChatStreamChunk>;
  } catch (error) {
    console.error('OpenRouter request failed:', error);
    return Response.json(
      { error: 'Failed to reach the model. Check your API key and model name.' },
      { status: 502 },
    );
  }

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices?.[0]?.delta?.content;
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
