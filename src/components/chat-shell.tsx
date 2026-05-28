'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useChatStream, type ChatEvent } from '../hooks/use-chat-stream';
import { useDmStream } from '../hooks/use-dm-stream';
import { RoomList, type RoomSummary } from './room-list';
import { RoomView } from './room-view';
import { DmSidebar } from './dm-sidebar';
import { DmView } from './dm-view';
import { DmRequestsView } from './dm-requests-view';
import { PresenceList } from './presence-list';
import type { ChatMessage } from './message-list';

export interface ChatShellProps {
  me: { id: string; displayName: string; avatarUrl: string | null; isVerified: boolean };
  rooms: RoomSummary[];
  initialRoomSlug: string;
  initialMessages: ChatMessage[];
}

export function ChatShell({ me, rooms, initialRoomSlug, initialMessages }: ChatShellProps) {
  const router = useRouter();
  const params = useSearchParams();
  const dmId = params?.get('dm');
  const view = params?.get('view');
  const mode: 'room' | 'dm' | 'requests' = dmId ? 'dm' : view === 'requests' ? 'requests' : 'room';

  // Room state (existing)
  const [activeSlug, setActiveSlug] = useState(initialRoomSlug);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== 'room') return;
    let alive = true;
    fetch(`/api/community/rooms/${encodeURIComponent(activeSlug)}/messages`, { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => { if (alive && j.success) setMessages(j.data.messages); })
      .catch(() => {});
    return () => { alive = false; };
  }, [activeSlug, mode]);

  const handleRoomEvent = useCallback((e: ChatEvent) => {
    if (e.event === 'message') {
      const m = e.data as ChatMessage & { roomSlug: string };
      if (m.roomSlug !== activeSlug) return;
      setMessages((prev) => prev.some((x) => x.id === m.id) ? prev : [...prev, m]);
    } else if (e.event === 'message_deleted') {
      const d = e.data as { id: string };
      setMessages((prev) => prev.map((m) => m.id === d.id ? { ...m, isDeleted: true, body: '' } : m));
    }
  }, [activeSlug]);

  const { connected: roomConnected } = useChatStream({ roomSlug: activeSlug, onEvent: handleRoomEvent });

  // DM state
  const dm = useDmStream({ meCommunityUserId: me.id });

  const activeRoom = rooms.find((r) => r.slug === activeSlug);
  const canPost = !!activeRoom && (!activeRoom.isVerifiedOnly || me.isVerified);

  const onSendRoom = async (body: string, attachmentIds: string[]) => {
    setError(null);
    const res = await fetch(`/api/community/rooms/${encodeURIComponent(activeSlug)}/messages`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, attachmentIds: attachmentIds.length ? attachmentIds : undefined }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({} as { error?: { code?: string; message?: string } }));
      setError(j.error?.message ?? `Send failed (${res.status})`);
      return false;
    }
    return true;
  };

  const onSelectRoom = (slug: string) => {
    setActiveSlug(slug);
    router.replace('/community');
  };
  const onSelectDm = (id: string) => {
    router.replace(`/community?dm=${encodeURIComponent(id)}`);
  };
  const onSelectRequests = () => {
    router.replace('/community?view=requests');
  };

  return (
    <div
      className="overflow-hidden rounded-xl border bg-background shadow-sm"
      style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr 220px',
        height: 'min(80vh, 760px)',
        minHeight: '560px',
      }}
    >
      {/* Left rail */}
      <aside className="flex min-h-0 flex-col overflow-y-auto border-r bg-card/30">
        <RoomList rooms={rooms} activeSlug={mode === 'room' ? activeSlug : ''} onSelect={onSelectRoom} />
        <div className="mt-2 px-1">
          <DmSidebar
            inbox={dm.inbox}
            requestsCount={dm.requests.length}
            activeDmId={mode === 'dm' ? dmId ?? null : null}
            isRequestsActive={mode === 'requests'}
            onSelectDm={onSelectDm}
            onSelectRequests={onSelectRequests}
          />
        </div>
        <div className="mt-auto border-t bg-card/50 p-2">
          <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Workspace
          </p>
          <nav className="flex flex-col gap-0.5">
            <Link
              href="/community/pitches"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground no-underline transition-colors hover:bg-accent/50 hover:text-foreground"
            >
              <span className="text-base leading-none" aria-hidden>📰</span>
              <span>Pitches</span>
            </Link>
            <Link
              href="/community/experts"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground no-underline transition-colors hover:bg-accent/50 hover:text-foreground"
            >
              <span className="text-base leading-none" aria-hidden>🔍</span>
              <span>Experts</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Center */}
      <section className="flex min-w-0 min-h-0 flex-col">
        {mode === 'room' && !roomConnected && (
          <div className="border-b border-amber-500/30 bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            Reconnecting…
          </div>
        )}
        {mode === 'dm' && !dm.connected && (
          <div className="border-b border-amber-500/30 bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            Reconnecting…
          </div>
        )}
        {mode === 'room' && (
          <RoomView
            roomName={activeRoom?.name ?? activeSlug}
            isVerifiedOnly={activeRoom?.isVerifiedOnly}
            canPost={canPost}
            postRestrictionReason={!canPost ? 'Only verified journalists post here. Read access is open.' : undefined}
            messages={messages}
            error={error}
            onSend={onSendRoom}
          />
        )}
        {mode === 'dm' && dmId && (
          <DmView conversationId={dmId} meId={me.id} isMuted={false} />
        )}
        {mode === 'requests' && (
          <DmRequestsView meId={me.id} />
        )}
      </section>

      {/* Right rail */}
      <aside className="overflow-y-auto border-l bg-card/30 px-3 py-4">
        <PresenceList online={dm.presence.online} journalists={dm.presence.journalists} />
      </aside>
    </div>
  );
}
