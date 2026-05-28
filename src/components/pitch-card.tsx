'use client';
import Link from 'next/link';
import type { PitchSummary } from '../types';
import { cn } from '../primitives/cn';

const STATUS_BADGE: Record<string, string> = {
  open: 'bg-emerald-500/15 text-emerald-700 ring-1 ring-inset ring-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400',
  claimed: 'bg-amber-500/15 text-amber-700 ring-1 ring-inset ring-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
  in_progress: 'bg-blue-500/15 text-blue-700 ring-1 ring-inset ring-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400',
  published: 'bg-violet-500/15 text-violet-700 ring-1 ring-inset ring-violet-500/30 dark:bg-violet-500/10 dark:text-violet-400',
  archived: 'bg-slate-500/15 text-slate-700 ring-1 ring-inset ring-slate-500/30 dark:bg-slate-500/10 dark:text-slate-400',
};

interface PitchCardProps {
  pitch: PitchSummary;
}

export function PitchCard({ pitch }: PitchCardProps) {
  return (
    <Link href={`/community/pitches/${pitch.id}`} className="block no-underline text-inherit">
      <article className="flex flex-col gap-1.5 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/30">
        <div className="text-base font-semibold text-foreground">{pitch.title}</div>
        <div className="line-clamp-2 text-sm text-muted-foreground">{pitch.summary}</div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize', STATUS_BADGE[pitch.status] ?? STATUS_BADGE.archived)}
          >
            {pitch.status.replace('_', ' ')}
          </span>
          <span className="text-xs text-muted-foreground">
            {pitch.claimCount} {pitch.claimCount === 1 ? 'claim' : 'claims'}
          </span>
          {pitch.tags.map((t) => (
            <span
              key={t.slug}
              className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              #{t.label}
            </span>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">by @{pitch.ownerHandle}</div>
      </article>
    </Link>
  );
}
