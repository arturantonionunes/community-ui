'use client';
import { useEffect, useRef } from 'react';
import { MessageItem, type ChatMessage } from './message-item';

export type { ChatMessage };

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages.length]);
  return (
    <div ref={ref} className="flex-1 overflow-y-auto py-2">
      {messages.map((m) => <MessageItem key={m.id} message={m} />)}
    </div>
  );
}
