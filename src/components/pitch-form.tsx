'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopicPicker } from './topic-picker';
import { Button } from '../primitives/button';
import { Input } from '../primitives/input';
import { Textarea } from '../primitives/textarea';
import { Label } from '../primitives/label';

interface PitchFormInitial {
  id: string;
  title: string;
  summary: string;
  body: string;
  tags: Array<{ slug: string; label: string }>;
  deadlineAt: string | null;
}

interface PitchFormProps {
  initial?: PitchFormInitial;
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PitchForm({ initial }: PitchFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [summary, setSummary] = useState(initial?.summary ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [tags, setTags] = useState<Array<{ slug: string; label: string }>>(initial?.tags ?? []);
  const [deadlineLocal, setDeadlineLocal] = useState(toDatetimeLocal(initial?.deadlineAt ?? null));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!initial;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (title.trim().length < 5) { setError('Title must be at least 5 characters.'); return; }
    if (summary.trim().length < 20) { setError('Summary must be at least 20 characters.'); return; }

    setSubmitting(true);
    try {
      const deadlineIso = deadlineLocal ? new Date(deadlineLocal).toISOString() : null;
      let res: Response;
      if (isEdit) {
        res = await fetch(`/api/community/pitches/${initial!.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            summary,
            body,
            deadlineAt: deadlineIso,
          }),
        });
      } else {
        res = await fetch('/api/community/pitches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            summary,
            body: body || undefined,
            tags,
            deadlineAt: deadlineIso ?? undefined,
          }),
        });
      }
      if (res.ok) {
        const j = (await res.json().catch(() => null)) as { data?: { id?: string } } | null;
        const id = j?.data?.id ?? initial?.id;
        if (id) {
          router.push(`/community/pitches/${id}`);
          router.refresh();
        }
        return;
      }
      const j = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
      setError(j?.error?.message ?? j?.error?.code ?? 'Could not save pitch.');
    } catch {
      setError('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="pitch-title">Title</Label>
        <Input
          id="pitch-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pitch-summary">Summary</Label>
        <Textarea
          id="pitch-summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          maxLength={2000}
          rows={3}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pitch-body">Body</Label>
        <Textarea
          id="pitch-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={10000}
          rows={8}
        />
      </div>
      <div className="space-y-1.5">
        <Label>
          Tags{' '}
          {isEdit && <span className="text-muted-foreground">(cannot be changed after creation)</span>}
        </Label>
        {isEdit ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.length === 0 && <span className="text-xs text-muted-foreground">No tags</span>}
            {tags.map((t) => (
              <span
                key={t.slug}
                className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                #{t.label}
              </span>
            ))}
          </div>
        ) : (
          <TopicPicker value={tags} onChange={setTags} max={6} />
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pitch-deadline">Deadline (optional)</Label>
        <Input
          id="pitch-deadline"
          type="datetime-local"
          value={deadlineLocal}
          onChange={(e) => setDeadlineLocal(e.target.value)}
          className="w-auto"
        />
      </div>
      {error && <div className="text-sm text-destructive">{error}</div>}
      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create pitch'}
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
