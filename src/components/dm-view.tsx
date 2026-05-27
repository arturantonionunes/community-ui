'use client';
import { useEffect, useState, useRef } from 'react';
import { Button } from '../primitives/button';
import { Textarea } from '../primitives/textarea';
import { DmMessageItem, type DmMessageView } from './dm-message-item';
import { BlockButton } from './block-button';

interface DmConversationData {
  id: string;
  peerId: string;
  acceptedAt: string | null;
}

interface DmHistoryResponse {
  conversation: DmConversationData;
  messages: DmMessageView[];
}

export function DmView({ conversationId, meId, isMuted }: { conversationId: string; meId: string; isMuted: boolean }) {
  const [data, setData] = useState<DmHistoryResponse | null>(null);
  const [peerName, setPeerName] = useState<string>('…');
  const [peerIsVerified, setPeerIsVerified] = useState<boolean>(false);
  const [body, setBody] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/community/dm/conversations/${encodeURIComponent(conversationId)}/messages`, { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => { if (alive && j.success) setData(j.data); })
      .catch(() => {});
    return () => { alive = false; };
  }, [conversationId]);

  // Also fetch the inbox to grab peer info (since /messages doesn't return peer profile).
  useEffect(() => {
    if (!data) return;
    let alive = true;
    fetch('/api/community/dm/conversations', { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => {
        if (!alive || !j.success) return;
        const entry = (j.data.conversations as Array<{ id: string; peer: { displayName: string; isVerified: boolean } }>)
          .find((c) => c.id === conversationId);
        if (entry) {
          setPeerName(entry.peer.displayName);
          setPeerIsVerified(entry.peer.isVerified);
        }
      });
    return () => { alive = false; };
  }, [data, conversationId]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [data?.messages.length]);

  const send = async () => {
    if (!body.trim() || pending) return;
    setPending(true); setError(null);
    const res = await fetch(`/api/community/dm/conversations/${encodeURIComponent(conversationId)}/messages`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: body.trim() }),
    });
    setPending(false);
    if (!res.ok) {
      const j = await res.json().catch(() => null as null | { error?: { code?: string; message?: string } });
      setError(j?.error?.message ?? `Failed (${res.status})`);
      return;
    }
    setBody('');
  };

  return (
    <>
      <div className="flex items-center justify-between border-b px-4 py-2 font-bold">
        <span>
          {peerName}
          {peerIsVerified && <span className="ml-1.5 text-[11px] text-amber-700">ⓥ</span>}
        </span>
        {data?.conversation.peerId && (
          <BlockButton blockedId={data.conversation.peerId} />
        )}
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto py-2">
        {data?.messages.map((m) => (
          <DmMessageItem key={m.id} message={m} meId={meId} peerName={peerName} />
        ))}
      </div>
      {isMuted ? (
        <div className="border-t p-3 text-xs text-muted-foreground">
          You are muted; you cannot send messages right now.
        </div>
      ) : (
        <div className="border-t p-2">
          {error && <div className="mb-1 text-xs text-destructive">{error}</div>}
          <div className="flex gap-2">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
              placeholder="Type a message…"
              rows={2}
              className="min-h-0 flex-1 resize-none"
            />
            <Button type="button" onClick={send} disabled={pending || !body.trim()} size="sm">
              {pending ? 'Sending…' : 'Send'}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
