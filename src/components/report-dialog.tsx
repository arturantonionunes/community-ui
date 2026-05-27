'use client';
import { useState } from 'react';
import { Button } from '../primitives/button';
import { Textarea } from '../primitives/textarea';
import { Label } from '../primitives/label';
import { RadioGroup, RadioGroupItem } from '../primitives/radio-group';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../primitives/dialog';

type Reason = 'spam' | 'abuse' | 'off-topic' | 'other';
const REASONS: Reason[] = ['spam', 'abuse', 'off-topic', 'other'];

export function ReportDialog({ messageId, onClose }: { messageId: string; onClose: () => void }) {
  const [reason, setReason] = useState<Reason>('spam');
  const [note, setNote] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setPending(true); setError(null);
    const res = await fetch(`/api/community/messages/${messageId}/report`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, note: note.trim() || undefined }),
    });
    setPending(false);
    if (res.ok) { setDone(true); setTimeout(onClose, 800); }
    else {
      const j = await res.json().catch(() => null as null | { error?: { code?: string; message?: string } });
      setError(j?.error?.message ?? `Failed (${res.status})`);
    }
  };

  return (
    <Dialog open onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="sm:max-w-sm">
        {done ? (
          <p className="text-sm">Thank you. The report is in the moderation queue.</p>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Report message</DialogTitle>
            </DialogHeader>
            <RadioGroup value={reason} onValueChange={(v) => setReason(v as Reason)} name="report-reason" className="gap-2">
              {REASONS.map((r) => (
                <div key={r} className="flex items-center gap-2">
                  <RadioGroupItem value={r} id={`report-${r}`} />
                  <Label htmlFor={`report-${r}`} className="cursor-pointer capitalize">{r}</Label>
                </div>
              ))}
            </RadioGroup>
            <div className="space-y-1.5">
              <Label htmlFor="report-note">Note (optional)</Label>
              <Textarea
                id="report-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note"
                rows={2}
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={pending}>Cancel</Button>
              <Button type="button" variant="destructive" onClick={submit} disabled={pending}>
                {pending ? 'Sending…' : 'Submit'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
