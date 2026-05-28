'use client';
import { CircleUserRound, BadgeCheck } from 'lucide-react';

export function PresenceList({ online, journalists }: { online: number; journalists: number }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Presence
        </p>
        <div className="mt-2 rounded-lg border bg-background/60 p-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
              <CircleUserRound className="size-4" aria-hidden />
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card bg-emerald-500" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{online} online</p>
              <p className="text-[11px] text-muted-foreground">In this channel right now</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Members
        </p>
        <div className="mt-2 rounded-lg border bg-background/60 p-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
              <BadgeCheck className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {journalists} verified
              </p>
              <p className="text-[11px] text-muted-foreground">
                Journalists{journalists === 1 ? '' : ' & contributors'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">
        Member list coming soon. Use <strong className="font-semibold text-foreground">/community/experts</strong>{' '}
        to discover contributors by expertise.
      </p>
    </div>
  );
}
