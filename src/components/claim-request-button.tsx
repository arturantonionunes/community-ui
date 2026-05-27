'use client';
import { useState } from 'react';
import { Button } from '../primitives/button';
import { Textarea } from '../primitives/textarea';
import { Label } from '../primitives/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../primitives/dialog';

interface ClaimRequestButtonProps {
  pitchId: string;
}

type State = 'idle' | 'submitting' | 'success' | 'error';

export function ClaimRequestButton({ pitchId }: ClaimRequestButtonProps) {
  const [state, setState] = useState<State>('idle');
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (state === 'success') {
    return (
      <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
        Claim sent
      </div>
    );
  }

  const submit = async () => {
    setState('submitting');
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/community/pitches/${pitchId}/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim() || undefined }),
      });
      if (res.status === 201) {
        setState('success');
        setOpen(false);
        return;
      }
      const j = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
      const code = j?.error?.code ?? 'UNKNOWN';
      const msg =
        code === 'CLAIM_ALREADY_EXISTS' ? 'You already claimed this pitch.' :
        code === 'RATE_LIMITED' ? 'Too many requests. Try again later.' :
        code === 'UNAUTHENTICATED' ? 'Sign in to claim.' :
        j?.error?.message ?? 'Could not submit claim.';
      setErrorMessage(msg);
      setState('error');
    } catch {
      setErrorMessage('Network error. Try again.');
      setState('error');
    }
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setNote('');
      setErrorMessage(null);
      setState('idle');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button type="button">Claim this pitch</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Claim this pitch</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="claim-note">Note (optional)</Label>
          <Textarea
            id="claim-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Why you?"
            disabled={state === 'submitting'}
          />
          {errorMessage && (
            <div className="text-xs text-destructive">{errorMessage}</div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={state === 'submitting'}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={state === 'submitting'}
          >
            {state === 'submitting' ? 'Submitting…' : 'Submit claim'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
