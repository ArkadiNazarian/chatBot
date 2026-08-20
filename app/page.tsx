'use client'

import { postMessage } from './action';

export default function Home() {

  const send = () => {
    postMessage();
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
     <button onClick={send}>Send Message</button>
    </div>
  );
}
