'use client';
import { cn } from '../primitives/cn';

export interface RoomSummary { id: string; slug: string; name: string; isVerifiedOnly: boolean }

export function RoomList({ rooms, activeSlug, onSelect }: {
  rooms: RoomSummary[]; activeSlug: string; onSelect: (slug: string) => void;
}) {
  return (
    <nav aria-label="Rooms" className="flex flex-col">
      {rooms.map((r) => {
        const isActive = r.slug === activeSlug;
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelect(r.slug)}
            className={cn(
              'rounded-md px-3 py-1.5 text-left text-sm text-foreground transition-colors duration-200 hover:bg-accent/50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isActive ? 'bg-accent font-semibold' : 'font-normal',
            )}
          >
            <span>{r.name}</span>
            {r.isVerifiedOnly && <span className="ml-1.5 text-[10px] text-amber-700">ⓥ</span>}
          </button>
        );
      })}
    </nav>
  );
}
