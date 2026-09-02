# AI Chat App

A ChatGPT-style chat interface built with Next.js, powered by OpenRouter for AI responses and Firebase Firestore for data persistence.

## Features

- **Real-time streaming responses** — AI replies stream in token-by-token via Server-Sent Events for a responsive chat experience.
- **User authentication** — Sign up and log in with email/password (stored in Firestore).
- **Chat rooms** — Conversations are organized into rooms. Create new chats, switch between them, and resume past conversations from the sidebar.
- **Persistent history** — All messages and rooms are saved to Firebase Firestore, so your chat history survives page reloads.
- **Stop generation** — Cancel an in-progress AI response at any time.
- **Responsive UI** — Clean, dark-themed interface styled with Tailwind CSS.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS 4 |
| State | [Zustand](https://github.com/pmndrs/zustand) (with persistence) |
| AI Backend | [OpenRouter SDK](https://openrouter.ai) — model: `inclusionai/ling-3.0-flash-fin:free` |
| Database | [Firebase Firestore](https://firebase.google.com/docs/firestore) |
| Forms | [Formik](https://formik.org) + [Yup](https://github.com/jquense/yup) validation |
| Notifications | [React Toastify](https://fkhadra.github.io/react-toastify/) |
| ID Generation | [Nanoid](https://github.com/ai/nanoid) |


## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Firestore enabled
- An [OpenRouter](https://openrouter.ai) API key

### 1. Install dependencies

```bash
yarn install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

> The Firebase configuration is currently hardcoded in `firebase/config.ts`. For production, move these values to environment variables.

### 3. Run the development server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.


## How It Works

1. **User sends a message** → The client POSTs to `/api/chat` with the message history and user ID.
2. **Server creates/reuses a room** → If no `roomId` is provided, a new room is created in Firestore with the first 15 characters of the message as its title.
3. **Server streams the AI response** → The OpenRouter SDK streams the model's reply token-by-token back to the client.
4. **Messages are persisted** → Both the user's message and the assistant's full reply are saved to the `chats` collection in Firestore.
5. **Client renders incrementally** → The UI appends each chunk to the assistant's message bubble in real time.
6. **Chat history loads on revisit** → Clicking a room in the sidebar fetches its messages via `/api/chat/[roomId]` and displays them.

## License

This project is private and not currently licensed for public use.
