'use client';
import { useState } from 'react';
import { TopicPicker } from './topic-picker';
import { Button } from '../primitives/button';
import { Label } from '../primitives/label';
import { cn } from '../primitives/cn';

interface ExpertiseEntry {
  slug: string;
  label: string;
  proficiency: number;
}

interface ExpertiseEditorProps {
  initial: ExpertiseEntry[];
}

const PROFICIENCY_OPTIONS = [
  { value: 1, text: 'Interested' },
  { value: 2, text: 'Knowledgeable' },
  { value: 3, text: 'Expert' },
] as const;

export function ExpertiseEditor({ initial }: ExpertiseEditorProps) {
  const [tags, setTags] = useState<ExpertiseEntry[]>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const onPick = (next: Array<{ slug: string; label: string }>) => {
    const existingSlugs = new Set(tags.map((t) => t.slug));
    const merged = [...tags];
    for (const item of next) {
      if (!existingSlugs.has(item.slug)) {
        merged.push({ slug: item.slug, label: item.label, proficiency: 2 });
      }
    }
    // Also handle removals from picker.
    const nextSlugs = new Set(next.map((t) => t.slug));
    setTags(merged.filter((t) => nextSlugs.has(t.slug)));
  };

  const setProficiency = (slug: string, proficiency: number) => {
    setTags((prev) => prev.map((t) => (t.slug === slug ? { ...t, proficiency } : t)));
  };

  const remove = (slug: string) => {
    setTags((prev) => prev.filter((t) => t.slug !== slug));
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/community/users/me/expertise', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tags: tags.map((t) => ({ slug: t.slug, label: t.label, proficiency: t.proficiency })),
        }),
      });
      if (res.ok) {
        setMessage({ kind: 'success', text: 'Saved' });
      } else {
        const j = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
        setMessage({ kind: 'error', text: j?.error?.message ?? j?.error?.code ?? 'Could not save expertise.' });
      }
    } catch {
      setMessage({ kind: 'error', text: 'Network error.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-1.5">
        <Label>Add areas of expertise (up to 20)</Label>
        <TopicPicker
          value={tags.map((t) => ({ slug: t.slug, label: t.label }))}
          onChange={onPick}
          max={20}
        />
      </div>

      {tags.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {tags.map((t) => (
            <div
              key={t.slug}
              className="flex items-center justify-between gap-2 rounded-md border p-2"
            >
              <span className="flex-1 text-sm font-medium">#{t.label}</span>
              <div className="flex items-center gap-3">
                {PROFICIENCY_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <input
                      type="radio"
                      name={`prof-${t.slug}`}
                      checked={t.proficiency === opt.value}
                      onChange={() => setProficiency(t.slug, opt.value)}
                      className="size-3.5 accent-primary"
                    />
                    {opt.text}
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={() => remove(t.slug)}
                aria-label={`Remove ${t.label}`}
                className="text-base text-muted-foreground transition-colors hover:text-foreground"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="button" onClick={save} disabled={saving} size="sm">
          {saving ? 'Saving…' : 'Save expertise'}
        </Button>
        {message && (
          <span
            className={cn(
              'text-sm',
              message.kind === 'success' ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive',
            )}
          >
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}
