'use client';
import { useEffect, useState } from 'react';
import { Button } from '../primitives/button';
import { Input } from '../primitives/input';
import { Label } from '../primitives/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../primitives/dialog';

export interface TopicRow {
  slug: string;
  label: string;
  usageCount: number;
}

interface TopicsAdminTableProps {
  initialTopics: TopicRow[];
}

export function TopicsAdminTable({ initialTopics }: TopicsAdminTableProps) {
  const [topics, setTopics] = useState<TopicRow[]>(initialTopics);
  const [renameOpen, setRenameOpen] = useState<TopicRow | null>(null);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rename = async (slug: string, label: string) => {
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/admin/community/topics/${encodeURIComponent(slug)}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        setError(j?.error?.message ?? `Failed (${res.status})`);
        return;
      }
      setTopics((prev) => prev.map((t) => (t.slug === slug ? { ...t, label } : t)));
      setRenameOpen(null);
    } finally {
      setBusy(false);
    }
  };

  const merge = async (sourceSlug: string, targetSlug: string) => {
    setBusy(true); setError(null);
    try {
      const res = await fetch('/api/admin/community/topics/merge', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceSlug, targetSlug }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        setError(j?.error?.message ?? `Failed (${res.status})`);
        return;
      }
      setTopics((prev) => prev.filter((t) => t.slug !== sourceSlug));
      setMergeOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => setMergeOpen(true)}
          disabled={topics.length < 2}
          size="sm"
        >
          Merge topics
        </Button>
      </div>

      {error && <div className="text-xs text-destructive">{error}</div>}

      {topics.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-muted-foreground">
          No topics yet.
        </div>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Label</th>
              <th className="p-2">Slug</th>
              <th className="p-2">Usage</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {topics.map((t) => (
              <tr key={t.slug} className="border-b border-slate-100">
                <td className="p-2">{t.label}</td>
                <td className="p-2 font-mono text-muted-foreground">{t.slug}</td>
                <td className="p-2">{t.usageCount}</td>
                <td className="p-2 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => setRenameOpen(t)}
                  >
                    Rename
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <RenameDialog
        topic={renameOpen}
        onClose={() => setRenameOpen(null)}
        onSave={(label) => {
          if (renameOpen) void rename(renameOpen.slug, label);
        }}
        busy={busy}
      />
      <MergeDialog
        open={mergeOpen}
        topics={topics}
        onClose={() => setMergeOpen(false)}
        onMerge={(src, tgt) => merge(src, tgt)}
        busy={busy}
      />
    </div>
  );
}

function RenameDialog({
  topic,
  onClose,
  onSave,
  busy,
}: {
  topic: TopicRow | null;
  onClose: () => void;
  onSave: (label: string) => void | Promise<void>;
  busy: boolean;
}) {
  const [label, setLabel] = useState(topic?.label ?? '');

  useEffect(() => {
    if (topic) setLabel(topic.label);
  }, [topic]);

  return (
    <Dialog
      open={!!topic}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename topic</DialogTitle>
          {topic && (
            <DialogDescription>
              Slug: <code className="font-mono">{topic.slug}</code>
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="topic-label">Label</Label>
          <Input
            id="topic-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void onSave(label.trim())}
            disabled={busy || !label.trim() || label.trim() === topic?.label}
          >
            {busy ? 'Saving…' : 'Rename'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MergeDialog({
  open,
  topics,
  onClose,
  onMerge,
  busy,
}: {
  open: boolean;
  topics: TopicRow[];
  onClose: () => void;
  onMerge: (sourceSlug: string, targetSlug: string) => void | Promise<void>;
  busy: boolean;
}) {
  const [source, setSource] = useState(topics[0]?.slug ?? '');
  const [target, setTarget] = useState(topics[1]?.slug ?? '');
  const disabled = busy || !source || !target || source === target;

  const selectClasses =
    'w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Merge topics</DialogTitle>
          <DialogDescription>
            Source topic is removed; its pitch tags and expertise links are reassigned to the target.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="merge-source">Source (will be removed)</Label>
          <select
            id="merge-source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className={selectClasses}
          >
            {topics.map((t) => (
              <option key={t.slug} value={t.slug}>{t.label} ({t.slug})</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="merge-target">Target (keeps)</Label>
          <select
            id="merge-target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className={selectClasses}
          >
            {topics.map((t) => (
              <option key={t.slug} value={t.slug}>{t.label} ({t.slug})</option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void onMerge(source, target)}
            disabled={disabled}
          >
            {busy ? 'Merging…' : 'Merge'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
