'use client';
import { useEffect, useState } from 'react';
import { Input } from '../primitives/input';

interface Topic { slug: string; label: string }
interface TopicPickerProps {
  value: Topic[];
  onChange: (next: Topic[]) => void;
  max?: number;
}

export function TopicPicker({ value, onChange, max = 6 }: TopicPickerProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 1) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/community/topics?q=${encodeURIComponent(query)}&limit=10`);
      setLoading(false);
      if (res.ok) {
        const j = (await res.json()) as { success: boolean; data?: { topics: Topic[] } };
        if (j.success && j.data) setSuggestions(j.data.topics);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const add = (t: Topic) => {
    if (value.some((v) => v.slug === t.slug)) return;
    if (value.length >= max) return;
    onChange([...value, t]);
    setQuery('');
    setSuggestions([]);
  };

  const addFreeText = () => {
    const label = query.trim();
    if (!label) return;
    const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
    if (slug.length < 2 || !/^[a-z]/.test(slug)) return;
    add({ slug, label });
  };

  return (
    <div>
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map((t) => (
            <span
              key={t.slug}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
            >
              #{t.label}
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v.slug !== t.slug))}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label={`Remove ${t.label}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFreeText(); } }}
          placeholder={value.length >= max ? `Max ${max} tags` : 'Add a topic…'}
          disabled={value.length >= max}
        />
        {suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-10 mt-1 max-h-52 overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
            {suggestions.map((s) => (
              <li key={s.slug}>
                <button
                  type="button"
                  onClick={() => add(s)}
                  className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  #{s.label}
                </button>
              </li>
            ))}
          </ul>
        )}
        {loading && <div className="mt-1 text-xs text-muted-foreground">Searching…</div>}
      </div>
    </div>
  );
}
