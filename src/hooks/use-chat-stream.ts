'use client';
import { useEffect, useRef, useState } from 'react';

export interface ChatEvent {
  event: 'message' | 'message_deleted' | 'presence' | 'ping';
  data: unknown;
}

interface UseChatStreamOptions {
  roomSlug: string;
  onEvent: (e: ChatEvent) => void;
  baseUrl?: string;
}

export function useChatStream({ roomSlug, onEvent, baseUrl = '' }: UseChatStreamOptions): { connected: boolean } {
  const [connected, setConnected] = useState(false);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    let backoffMs = 2000;
    let es: EventSource | null = null;
    let stopped = false;

    const dispatch = (event: ChatEvent['event']) => (raw: MessageEvent) => {
      try {
        onEventRef.current({ event, data: JSON.parse(raw.data) });
      } catch {
        onEventRef.current({ event, data: raw.data });
      }
    };

    const connect = () => {
      if (stopped) return;
      es = new EventSource(`${baseUrl}/api/community/rooms/${encodeURIComponent(roomSlug)}/stream`, { withCredentials: true });
      es.addEventListener('open', () => {
        setConnected(true);
        backoffMs = 2000;
      });
      es.addEventListener('message', dispatch('message'));
      es.addEventListener('message_deleted', dispatch('message_deleted'));
      es.addEventListener('presence', dispatch('presence'));
      es.addEventListener('ping', dispatch('ping'));
      es.addEventListener('error', () => {
        setConnected(false);
        es?.close();
        es = null;
        if (stopped) return;
        const delay = Math.min(backoffMs, 30_000);
        setTimeout(connect, delay);
        backoffMs = Math.min(backoffMs * 2, 30_000);
      });
    };

    connect();
    return () => { stopped = true; es?.close(); };
  }, [roomSlug, baseUrl]);

  return { connected };
}
