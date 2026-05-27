'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../primitives/button';
import { Input } from '../primitives/input';
import { Textarea } from '../primitives/textarea';
import { Label } from '../primitives/label';
import { Checkbox } from '../primitives/checkbox';
import { RadioGroup, RadioGroupItem } from '../primitives/radio-group';

type ContactPref = 'email' | 'community-dm' | 'signal' | 'none';

const CONTACT_OPTIONS: Array<{ value: ContactPref; label: string }> = [
  { value: 'email', label: 'Email' },
  { value: 'community-dm', label: 'Community DM' },
  { value: 'signal', label: 'Signal' },
  { value: 'none', label: 'Do not contact me' },
];

export function TipForm() {
  const router = useRouter();
  const [storySummary, setStorySummary] = useState('');
  const [context, setContext] = useState('');
  const [contactPref, setContactPref] = useState<ContactPref>('community-dm');
  const [contactValue, setContactValue] = useState('');
  const [prefersAnonymousPublish, setPrefersAnonymousPublish] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
        <div className="mb-1 text-base font-semibold">Tip received. Thank you.</div>
        <div className="text-sm">A journalist will follow up if needed.</div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (storySummary.trim().length < 5) {
      setError('Story summary must be at least 5 characters.');
      return;
    }
    if (storySummary.length > 500) {
      setError('Story summary must be 500 characters or fewer.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/community/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storySummary,
          context: context || undefined,
          contactPref,
          contactValue: contactPref !== 'none' ? contactValue || undefined : undefined,
          prefersAnonymousPublish,
        }),
      });
      if (res.status === 201) {
        setSuccess(true);
        return;
      }
      if (res.status === 429) {
        setError('Rate limited, try again later.');
        return;
      }
      const j = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
      setError(j?.error?.message ?? j?.error?.code ?? 'Could not submit tip.');
    } catch {
      setError('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="tip-story-summary">
          Story summary <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="tip-story-summary"
          value={storySummary}
          onChange={(e) => setStorySummary(e.target.value)}
          minLength={5}
          maxLength={500}
          rows={3}
          required
          placeholder="In a few sentences, what is the story?"
        />
        <div className="text-xs text-muted-foreground">{storySummary.length}/500</div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tip-context">Context (optional)</Label>
        <Textarea
          id="tip-context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          maxLength={5000}
          rows={6}
          placeholder="Add background, links, names, dates, evidence."
        />
        <div className="text-xs text-muted-foreground">{context.length}/5000</div>
      </div>

      <div className="space-y-2">
        <Label>Preferred contact method</Label>
        <RadioGroup
          name="contact-pref"
          value={contactPref}
          onValueChange={(v) => setContactPref(v as ContactPref)}
          className="gap-2"
        >
          {CONTACT_OPTIONS.map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <RadioGroupItem value={opt.value} id={`contact-${opt.value}`} />
              <Label htmlFor={`contact-${opt.value}`} className="font-normal">
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {contactPref !== 'none' && (
        <div className="space-y-1.5">
          <Label htmlFor="tip-contact-value">Contact value</Label>
          <Input
            id="tip-contact-value"
            value={contactValue}
            onChange={(e) => setContactValue(e.target.value)}
            maxLength={500}
            placeholder={
              contactPref === 'email' ? 'you@example.com' :
              contactPref === 'signal' ? 'Signal number or username' :
              'Your community handle'
            }
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <Checkbox
          id="tip-anonymous"
          checked={prefersAnonymousPublish}
          onCheckedChange={(checked) => setPrefersAnonymousPublish(checked === true)}
        />
        <Label htmlFor="tip-anonymous" className="font-normal">
          Publish anonymously if this becomes a story
        </Label>
      </div>

      {error && <div className="text-sm text-destructive">{error}</div>}

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send tip'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
