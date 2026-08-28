import { OpenRouter } from '@openrouter/sdk';
import type { ChatStreamChunk } from '@openrouter/sdk/models';
import { GetLastChat, SendMessage } from '@/firebase/chats/firestore-action';
import { nanoid } from 'nanoid';
import { MakeRoom } from '@/firebase/rooms/firestore-action';

const MODEL = 'inclusionai/ling-3.0-flash-fin:free'

// 'inclusionai/ling-3.0-flash-fin:free'
// 'nvidia/nemotron-3.5-lightning:free'
type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export async function POST(req: Request) {
  const { messages, roomId, userId } = (await req.json()) as {
    messages?: ChatMessage[];
    roomId?: string;
    userId: string;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: 'A non-empty messages array is required.' }, { status: 400 });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return Response.json({ error: 'OPENROUTER_API_KEY is not set.' }, { status: 500 });
  }

  // Reuse the last chat for this room when it exists; otherwise start a new room.
  let room = roomId;
  if (room) {
    const lastChat = await GetLastChat(room);
    if (lastChat.status !== 200) {
      room = undefined;
    }
  }


  // Persist the latest message to Firebase for the current room.
  const lastMessage = messages[messages.length - 1];


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
  let assistantReply = '';

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices?.[0]?.delta?.content;
          if (content) {
            assistantReply += content;
            controller.enqueue(encoder.encode(content));
          }
        }
        // Persist the assistant's streamed reply once it is complete.
        if (assistantReply) {

          if (!room) {
            room = nanoid();
            const makeRoom = await MakeRoom({
              _id: room,
              timestamp: Date.now(),
              title: messages[messages.length - 1].content.slice(0, 15),
              userId: userId,
            });
            if (makeRoom.status !== 200) {
              return Response.json({ error: 'Failed to create a new room.' }, { status: 500 });
            }
          }

          if (lastMessage && lastMessage.role !== 'system') {
            await SendMessage({
              _id: nanoid(),
              roomId: room,
              timestamp: Date.now(),
              userId: userId,
              messages: {
                role: lastMessage.role,
                content: lastMessage.content,
                timestamp: Date.now(),
              },
            });
          }

          await SendMessage({
            _id: nanoid(),
            roomId: room,
            userId: userId,
            timestamp: Date.now(),
            messages: {
              role: 'assistant',
              content: assistantReply,
              timestamp: Date.now(),
            },
          });
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
      'X-Room-Id': room,
    },
  });
}
