'use client';
import { useState } from 'react';
import { Input } from '../primitives/input';
import { Textarea } from '../primitives/textarea';
import { Label } from '../primitives/label';

export type TipStatus = 'pending' | 'reviewing' | 'actioned' | 'dismissed';

export interface TipRow {
  id: string;
  submitter: { handle: string; displayName: string };
  prefersAnonymousPublish: boolean;
  storySummary: string;
  context: string | null;
  contactPref: string | null;
  contactValue: string | null;
  status: TipStatus;
  assignedToUserId: string | null;
  internalNotes: string | null;
  createdAt: string;
}

interface TipsAdminTableProps {
  initialTips: TipRow[];
}

const STATUS_OPTIONS: TipStatus[] = ['pending', 'reviewing', 'actioned', 'dismissed'];

export function TipsAdminTable({ initialTips }: TipsAdminTableProps) {
  const [tips, setTips] = useState<TipRow[]>(initialTips);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const patchTip = async (id: string, patch: Partial<Pick<TipRow, 'status' | 'assignedToUserId' | 'internalNotes'>>) => {
    setSaving((s) => ({ ...s, [id]: true }));
    setErrors((e) => ({ ...e, [id]: null }));
    try {
      const res = await fetch(`/api/admin/community/tips/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        setErrors((e) => ({ ...e, [id]: j?.error?.message ?? `Failed (${res.status})` }));
      } else {
        setTips((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      }
    } catch {
      setErrors((e) => ({ ...e, [id]: 'Network error' }));
    } finally {
      setSaving((s) => ({ ...s, [id]: false }));
    }
  };

  if (tips.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-muted-foreground">
        No tips submitted yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {tips.map((tip) => {
        const isSaving = saving[tip.id] ?? false;
        const err = errors[tip.id] ?? null;
        return (
          <article
            key={tip.id}
            className="flex flex-col gap-2.5 rounded-lg border bg-card p-3.5"
          >
            <header className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold">
                  {tip.prefersAnonymousPublish ? 'Anonymous publish requested' : 'OK to credit submitter'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Submitted by @{tip.submitter.handle} · {new Date(tip.createdAt).toLocaleString()}
                </div>
              </div>
              <select
                value={tip.status}
                disabled={isSaving}
                onChange={(e) => void patchTip(tip.id, { status: e.target.value as TipStatus })}
                className="rounded-md border border-input bg-transparent px-2 py-1.5 text-xs shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </header>

            <div className="whitespace-pre-wrap text-sm text-foreground">{tip.storySummary}</div>
            {tip.context && (
              <div className="whitespace-pre-wrap border-l-[3px] border-border pl-2 text-xs text-slate-600">
                {tip.context}
              </div>
            )}

            <div className="text-[11px] text-muted-foreground">
              Contact: {tip.contactPref ?? '—'}
              {tip.contactValue ? ` (${tip.contactValue})` : ''}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`tip-assignee-${tip.id}`} className="text-xs text-slate-600">
                Assignee user ID (optional)
              </Label>
              <Input
                id={`tip-assignee-${tip.id}`}
                type="text"
                defaultValue={tip.assignedToUserId ?? ''}
                placeholder="UUID or empty"
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  const next = v === '' ? null : v;
                  if (next === tip.assignedToUserId) return;
                  void patchTip(tip.id, { assignedToUserId: next });
                }}
                disabled={isSaving}
                className="text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`tip-notes-${tip.id}`} className="text-xs text-slate-600">
                Internal notes
              </Label>
              <Textarea
                id={`tip-notes-${tip.id}`}
                defaultValue={tip.internalNotes ?? ''}
                rows={2}
                onBlur={(e) => {
                  const v = e.target.value;
                  const next = v === '' ? null : v;
                  if (next === tip.internalNotes) return;
                  void patchTip(tip.id, { internalNotes: next });
                }}
                disabled={isSaving}
                className="text-xs"
              />
            </div>

            {err && <div className="text-xs text-destructive">{err}</div>}
            {isSaving && <div className="text-[11px] text-muted-foreground">Saving…</div>}
          </article>
        );
      })}
    </div>
  );
}
