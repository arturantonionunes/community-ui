'use client';
import { useState } from 'react';
import { Loader2, MessageSquare, Newspaper, GraduationCap, Lightbulb, ArrowRight } from 'lucide-react';
import { Button } from '../primitives/button';

export interface JoinCommunityCardProps {
  variant?: 'default' | 'error';
}

const BENEFITS = [
  {
    icon: MessageSquare,
    title: 'Rooms & DMs',
    desc: 'Real-time chat with verified journalists.',
  },
  {
    icon: Newspaper,
    title: 'Pitch marketplace',
    desc: 'Post leads, claim assignments, ship stories.',
  },
  {
    icon: GraduationCap,
    title: 'Expert directory',
    desc: 'Find contributors by subject expertise.',
  },
  {
    icon: Lightbulb,
    title: 'Confidential tips',
    desc: 'Send leads straight to the editorial team.',
  },
];

export function JoinCommunityCard({ variant = 'default' }: JoinCommunityCardProps) {
  const [pending, setPending] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  async function handleJoin() {
    setPending(true);
    setFetchError(false);
    const res = await fetch('/api/community/provision', { method: 'POST', credentials: 'include' });
    if (res.ok) window.location.href = '/community?welcome=1';
    else {
      setPending(false);
      setFetchError(true);
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        Cross-platform contributor network
      </p>

      <h1 className="mt-3 text-balance text-center text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        Join the NewsX Community
      </h1>

      <p className="mx-auto mt-4 max-w-lg text-balance text-center text-base leading-relaxed text-muted-foreground">
        One shared workspace across the&nbsp;Wire, PressX and Austria Wire — chat with journalists,
        pitch stories, find experts, and route confidential tips to the editorial desk.
      </p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {BENEFITS.map(({ icon: Icon, title, desc }) => (
          <li
            key={title}
            className="flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/30"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-foreground/80">
              <Icon className="size-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{title}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{desc}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-col items-center gap-3">
        <Button
          size="lg"
          onClick={handleJoin}
          disabled={pending}
          className="group h-12 min-w-[200px] px-6 text-sm font-semibold"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Connecting…
            </>
          ) : (
            <>
              Join the community
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </Button>

        <p className="text-[11px] text-muted-foreground">
          Free · No spam · Sign in once across platforms
        </p>

        {variant === 'error' && (
          <p className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            We couldn&apos;t connect to the community. Please try again.
          </p>
        )}
        {fetchError && (
          <p className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </section>
  );
}
