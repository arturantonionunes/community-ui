'use client';
import { useEffect, useRef, useState } from 'react';

interface InboxEntry {
  id: string;
  peer: { id: string; displayName: string; avatarUrl: string | null; isVerified: boolean };
  lastMessage: { id: string; body: string; createdAt: string; authorId: string } | null;
  unreadCount: number;
}

interface RequestEntry {
  id: string;
  peer: { id: string; displayName: string; avatarUrl: string | null; isVerified: boolean };
  lastMessage: { id: string; body: string; createdAt: string; authorId: string } | null;
  unreadCount: number;
}

export interface UseDmStream {
  connected: boolean;
  inbox: InboxEntry[];
  requests: RequestEntry[];
  presence: { online: number; journalists: number };
  refresh: () => void;
}

export function useDmStream({
  meCommunityUserId: _me,
  baseUrl = '',
}: {
  meCommunityUserId: string;
  baseUrl?: string;
}): UseDmStream {
  const [connected, setConnected] = useState(false);
  const [inbox, setInbox] = useState<InboxEntry[]>([]);
  const [requests, setRequests] = useState<RequestEntry[]>([]);
  const [presence, setPresence] = useState<{ online: number; journalists: number }>({ online: 0, journalists: 0 });
  const esRef = useRef<EventSource | null>(null);

  const refresh = () => {
    fetch(`${baseUrl}/api/community/dm/conversations`, { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => { if (j.success) setInbox(j.data.conversations); })
      .catch(() => {});
    fetch(`${baseUrl}/api/community/dm/requests`, { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => { if (j.success) setRequests(j.data.conversations); })
      .catch(() => {});
  };

  useEffect(() => {
    refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let backoffMs = 2000;
    let stopped = false;

    const connect = () => {
      if (stopped) return;
      const es = new EventSource(`${baseUrl}/api/community/dm/stream`, { withCredentials: true });
      esRef.current = es;

      es.addEventListener('open', () => {
        setConnected(true);
        backoffMs = 2000;
      });

      es.addEventListener('dm_message', () => { refresh(); });
      es.addEventListener('dm_request', () => { refresh(); });
      es.addEventListener('dm_request_accepted', () => { refresh(); });
      es.addEventListener('dm_request_declined', () => { refresh(); });
      es.addEventListener('dm_message_deleted', () => { refresh(); });
      es.addEventListener('dm_read', () => { /* no-op for badges; could be used to clear local optimistic state */ });
      es.addEventListener('block_applied', () => { refresh(); });
      es.addEventListener('presence', (raw: MessageEvent) => {
        try {
          const data = JSON.parse(raw.data) as { online: number; journalists: number };
          setPresence(data);
        } catch { /* ignore */ }
      });
      es.addEventListener('ping', () => { /* keepalive only */ });

      es.addEventListener('error', () => {
        setConnected(false);
        es.close();
        esRef.current = null;
        if (stopped) return;
        const delay = Math.min(backoffMs, 30_000);
        setTimeout(connect, delay);
        backoffMs = Math.min(backoffMs * 2, 30_000);
      });
    };

    connect();
    return () => { stopped = true; esRef.current?.close(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  return { connected, inbox, requests, presence, refresh };
}
