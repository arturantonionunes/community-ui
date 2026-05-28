'use client';
import { useState } from 'react';
import { cn } from '../primitives/cn';
import { NewMessageDialog } from './new-message-dialog';

export interface DmSidebarInboxEntry {
  id: string;
  peer: { id: string; displayName: string; isVerified: boolean };
  lastMessage: { body: string; createdAt: string; authorId: string } | null;
  unreadCount: number;
}

export interface DmSidebarProps {
  inbox: DmSidebarInboxEntry[];
  requestsCount: number;
  activeDmId: string | null;
  isRequestsActive: boolean;
  onSelectDm: (id: string) => void;
  onSelectRequests: () => void;
}

export function DmSidebar({ inbox, requestsCount, activeDmId, isRequestsActive, onSelectDm, onSelectRequests }: DmSidebarProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      <div className="mb-1.5 text-[10px] font-bold uppercase text-muted-foreground">
        Direct messages
      </div>
      {inbox.length === 0 ? (
        <div className="mb-2 text-[11px] text-slate-400">No conversations yet.</div>
      ) : (
        inbox.map((c) => {
          const isActive = c.id === activeDmId;
          const bold = c.unreadCount > 0;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectDm(c.id)}
              className={cn(
                'flex w-full items-center justify-between rounded-md px-2.5 py-1 text-left text-sm text-foreground transition-colors duration-200 hover:bg-accent/50',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive ? 'bg-accent' : 'bg-transparent',
                isActive || bold ? 'font-semibold' : 'font-normal',
              )}
            >
              <span>
                {c.peer.displayName}
                {c.peer.isVerified && <span className="ml-1 text-[10px] text-amber-700">ⓥ</span>}
              </span>
              {c.unreadCount > 0 && (
                <span className="min-w-[18px] rounded-full bg-destructive px-1.5 py-0.5 text-center text-[10px] text-white">
                  {c.unreadCount}
                </span>
              )}
            </button>
          );
        })
      )}
      <button
        type="button"
        onClick={onSelectRequests}
        className={cn(
          'mt-1.5 w-full rounded-md px-2.5 py-1 text-left text-xs transition-colors duration-200 hover:bg-accent/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isRequestsActive ? 'bg-accent' : 'bg-transparent',
          requestsCount > 0 ? 'text-foreground' : 'text-muted-foreground',
          isRequestsActive || requestsCount > 0 ? 'font-semibold' : 'font-normal',
        )}
      >
        Requests {requestsCount > 0 && <span className="text-destructive">({requestsCount})</span>}
      </button>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className="mt-2 w-full cursor-pointer rounded-md border border-dashed border-input bg-transparent px-2.5 py-1 text-[11px] text-slate-600 transition-colors duration-200 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        + New message
      </button>
      {dialogOpen && (
        <NewMessageDialog
          onClose={() => setDialogOpen(false)}
          onSent={(conversationId) => { setDialogOpen(false); onSelectDm(conversationId); }}
        />
      )}
    </>
  );
}
