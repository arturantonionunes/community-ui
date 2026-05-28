'use client';
import { Hash, Search, ShieldCheck } from 'lucide-react';
import { MessageList, type ChatMessage } from './message-list';
import { MessageComposer } from './message-composer';

export interface RoomViewProps {
  roomName: string;
  isVerifiedOnly?: boolean;
  canPost: boolean;
  postRestrictionReason?: string;
  messages: ChatMessage[];
  error: string | null;
  onSend: (body: string, attachmentIds: string[]) => Promise<boolean>;
}

export function RoomView({
  roomName,
  isVerifiedOnly,
  canPost,
  postRestrictionReason,
  messages,
  error,
  onSend,
}: RoomViewProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background">
      {/* Channel header */}
      <header className="flex items-center gap-3 border-b bg-card/50 px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
            <Hash className="size-4 text-muted-foreground" aria-hidden />
          </span>
          <h2 className="truncate text-lg font-bold leading-tight tracking-tight">{roomName}</h2>
          {isVerifiedOnly && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 ring-1 ring-inset ring-amber-500/30"
              title="Verified-only channel"
            >
              <ShieldCheck className="size-3" aria-hidden />
              Verified
            </span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              placeholder={`Search in ${roomName}`}
              aria-label={`Search in ${roomName}`}
              className="h-9 w-56 rounded-lg border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
      </header>

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Error */}
      {error && (
        <div className="border-t border-destructive/30 bg-destructive/5 px-5 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Composer */}
      <MessageComposer
        canPost={canPost}
        reason={postRestrictionReason}
        placeholder={`Message #${roomName}`}
        onSend={onSend}
      />
    </div>
  );
}
