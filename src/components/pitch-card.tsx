'use client';
import Link from 'next/link';
import type { PitchSummary } from '../types';

const STATUS_COLOR: Record<string, string> = {
  open: '#10b981',
  claimed: '#f59e0b',
  in_progress: '#3b82f6',
  published: '#8b5cf6',
  archived: '#9ca3af',
};

interface PitchCardProps {
  pitch: PitchSummary;
}

export function PitchCard({ pitch }: PitchCardProps) {
  const color = STATUS_COLOR[pitch.status] ?? '#9ca3af';
  return (
    <Link href={`/community/pitches/${pitch.id}`} className="block no-underline text-inherit">
      <article className="flex flex-col gap-1.5 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/30">
        <div className="text-base font-semibold text-foreground">{pitch.title}</div>
        <div className="line-clamp-2 text-sm text-muted-foreground">{pitch.summary}</div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize text-white"
            style={{ background: color }}
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
