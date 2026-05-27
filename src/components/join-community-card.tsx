'use client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '../primitives/button';

export interface JoinCommunityCardProps {
  variant?: 'default' | 'error';
}

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
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="text-base font-semibold">NewsX Community</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Connect with journalists across the newsX platforms.
      </p>
      {variant === 'error' && (
        <p className="mt-2 text-sm text-destructive">
          We couldn&apos;t connect to the community. Please try again.
        </p>
      )}
      {fetchError && (
        <p className="mt-2 text-sm text-destructive">
          Something went wrong. Please try again.
        </p>
      )}
      <Button onClick={handleJoin} disabled={pending} className="mt-3">
        {pending ? <Loader2 className="size-4 animate-spin" /> : 'Join Community'}
      </Button>
    </div>
  );
}
