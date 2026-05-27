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
    <div className="grid h-[calc(100vh-80px)] grid-cols-[220px_1fr_180px]">
      <aside className="overflow-y-auto border-r p-3">
        <RoomList rooms={rooms} activeSlug={mode === 'room' ? activeSlug : ''} onSelect={onSelectRoom} />
        <div className="mt-4">
          <DmSidebar
            inbox={dm.inbox}
            requestsCount={dm.requests.length}
            activeDmId={mode === 'dm' ? dmId ?? null : null}
            isRequestsActive={mode === 'requests'}
            onSelectDm={onSelectDm}
            onSelectRequests={onSelectRequests}
          />
        </div>
        <nav className="mt-4 flex flex-col gap-1">
          <Link
            href="/community/pitches"
            className="block rounded-md px-2 py-1.5 text-sm text-foreground no-underline transition-colors hover:bg-accent/50"
          >
            📰 Pitches
          </Link>
          <Link
            href="/community/experts"
            className="block rounded-md px-2 py-1.5 text-sm text-foreground no-underline transition-colors hover:bg-accent/50"
          >
            🔍 Experts
          </Link>
        </nav>
      </aside>

      <section className="flex min-w-0 flex-col">
        {mode === 'room' && !roomConnected && (
          <div className="bg-amber-100 p-1.5 text-center text-xs text-amber-800">
            Reconnecting…
          </div>
        )}
        {mode === 'dm' && !dm.connected && (
          <div className="bg-amber-100 p-1.5 text-center text-xs text-amber-800">
            Reconnecting…
          </div>
        )}
        {mode === 'room' && (
          <RoomView
            roomName={activeRoom?.name ?? '#' + activeSlug}
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

      <aside className="overflow-y-auto border-l p-3">
        <PresenceList online={dm.presence.online} journalists={dm.presence.journalists} />
      </aside>
    </div>
  );
}
