'use client';
import { useState } from 'react';
import { Button } from '../primitives/button';

interface ActivityItem {
  id: string;
  roomSlug: string;
  roomName: string;
  body: string;
  createdAt: string;
}

export function ProfileActivityFeed({ handle, initialMessages }: { handle: string; initialMessages: ActivityItem[] }) {
  const [messages, setMessages] = useState<ActivityItem[]>(initialMessages);
  const [nextCursor, setNextCursor] = useState<string | null>(initialMessages.length === 10 ? initialMessages[initialMessages.length - 1]!.createdAt : null);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (!nextCursor || loading) return;
    setLoading(true);
    const url = `/api/community/users/by-handle/${encodeURIComponent(handle)}/activity?before=${encodeURIComponent(nextCursor)}&limit=20`;
    const res = await fetch(url);
    const j = (await res.json()) as { success: boolean; data?: { messages: ActivityItem[]; nextCursor: string | null } };
    setLoading(false);
    if (j.success && j.data) {
      setMessages((prev) => [...prev, ...j.data!.messages]);
      setNextCursor(j.data.nextCursor);
    }
  };

  if (messages.length === 0) {
    return (
      <section className="p-6">
        <h2 className="mt-0 text-base font-semibold">Recent activity</h2>
        <p className="text-sm text-slate-400">No public activity yet.</p>
      </section>
    );
  }

  return (
    <section className="p-6">
      <h2 className="mt-0 text-base font-semibold">Recent activity</h2>
      <ul className="m-0 list-none p-0">
        {messages.map((m) => (
          <li key={m.id} className="border-b border-slate-100 py-2.5">
            <div className="text-xs text-muted-foreground">
              In {m.roomName} · {new Date(m.createdAt).toLocaleString()}
            </div>
            <div className="mt-1 whitespace-pre-wrap text-sm">{m.body}</div>
          </li>
        ))}
      </ul>
      {nextCursor && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={loadMore}
          disabled={loading}
          className="mt-3"
        >
          {loading ? 'Loading…' : 'Load more'}
        </Button>
      )}
    </section>
  );
}
