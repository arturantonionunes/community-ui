'use client';
import { Hash, ShieldCheck } from 'lucide-react';
import { cn } from '../primitives/cn';

export interface RoomSummary {
  id: string;
  slug: string;
  name: string;
  isVerifiedOnly: boolean;
}

export function RoomList({
  rooms,
  activeSlug,
  onSelect,
}: {
  rooms: RoomSummary[];
  activeSlug: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="px-2 pb-1.5 pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Channels
        </p>
      </div>
      <nav aria-label="Rooms" className="flex flex-col gap-0.5 px-1">
        {rooms.map((r) => {
          const isActive = r.slug === activeSlug;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelect(r.slug)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'bg-accent font-semibold text-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              )}
            >
              <Hash
                className={cn(
                  'size-3.5 shrink-0',
                  isActive ? 'text-foreground' : 'text-muted-foreground/70',
                )}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate">{r.name}</span>
              {r.isVerifiedOnly && (
                <ShieldCheck
                  className="size-3 shrink-0 text-amber-500"
                  aria-label="Verified-only"
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
