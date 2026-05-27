'use client';
import { useState } from 'react';
import { Button } from '../primitives/button';
import { Textarea } from '../primitives/textarea';

interface PendingClaim {
  id: string;
  claimantId: string;
  claimantHandle: string;
  claimantDisplayName: string;
  note: string | null;
  createdAt: string | Date;
}

interface ClaimListProps {
  pitchId: string;
  pendingClaims: PendingClaim[];
}

export function ClaimList({ pitchId, pendingClaims }: ClaimListProps) {
  const [claims, setClaims] = useState<PendingClaim[]>(pendingClaims);
  const [pending, setPending] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectMessage, setRejectMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const decide = async (claimId: string, action: 'approve' | 'reject', message?: string) => {
    setPending(claimId);
    setError(null);
    try {
      const res = await fetch(`/api/community/pitches/${pitchId}/claims/${claimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, message: message?.trim() || undefined }),
      });
      if (res.ok) {
        setClaims((prev) => prev.filter((c) => c.id !== claimId));
        setRejectingId(null);
        setRejectMessage('');
      } else {
        const j = (await res.json().catch(() => null)) as { error?: { code?: string } } | null;
        setError(j?.error?.code ?? 'Could not update claim.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setPending(null);
    }
  };

  if (claims.length === 0) {
    return <div className="text-sm text-muted-foreground">No pending claims.</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-semibold text-foreground">Pending claims ({claims.length})</div>
      {error && <div className="text-xs text-destructive">{error}</div>}
      {claims.map((c) => (
        <div
          key={c.id}
          className="flex flex-col gap-2 rounded-md border bg-card p-3"
        >
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-sm">
              <span className="font-semibold">{c.claimantDisplayName}</span>
              <span className="ml-1.5 text-muted-foreground">@{c.claimantHandle}</span>
            </div>
          </div>
          {c.note && (
            <div className="whitespace-pre-wrap text-sm text-muted-foreground">{c.note}</div>
          )}
          {rejectingId === c.id ? (
            <div className="flex flex-col gap-2">
              <Textarea
                value={rejectMessage}
                onChange={(e) => setRejectMessage(e.target.value)}
                rows={2}
                maxLength={2000}
                placeholder="Optional message to the claimant"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => decide(c.id, 'reject', rejectMessage)}
                  disabled={pending === c.id}
                >
                  {pending === c.id ? 'Rejecting…' : 'Confirm reject'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => { setRejectingId(null); setRejectMessage(''); }}
                  disabled={pending === c.id}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => decide(c.id, 'approve')}
                  disabled={pending === c.id}
                >
                  {pending === c.id ? 'Approving…' : 'Approve'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setRejectingId(c.id)}
                  disabled={pending === c.id}
                >
                  Reject
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
