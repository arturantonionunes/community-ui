'use client';
import { useEffect, useState } from 'react';
import { Button } from '../primitives/button';
import { Input } from '../primitives/input';
import { Textarea } from '../primitives/textarea';
import { Label } from '../primitives/label';
import { Checkbox } from '../primitives/checkbox';
import { ExpertiseEditor } from './expertise-editor';

interface ExpertiseEntry {
  slug: string;
  label: string;
  proficiency: number;
}

interface EditFormProps {
  initial: {
    handle: string;
    displayName: string;
    byline: string | null;
    bio: string;
    avatarUrl: string | null;
    isProfilePrivate: boolean;
    showActivity: boolean;
  };
  initialExpertise?: ExpertiseEntry[];
}

interface AvailabilityState {
  status: 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'reserved' | 'throttled' | 'same';
  nextAvailableAt?: string;
}

export function ProfileEditForm({ initial, initialExpertise }: EditFormProps) {
  const [expertise, setExpertise] = useState<ExpertiseEntry[] | null>(initialExpertise ?? null);

  useEffect(() => {
    if (initialExpertise !== undefined) return;
    let alive = true;
    fetch('/api/community/users/me/expertise', { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (j?.success && Array.isArray(j.data?.tags)) {
          setExpertise(j.data.tags as ExpertiseEntry[]);
        } else {
          setExpertise([]);
        }
      })
      .catch(() => { if (alive) setExpertise([]); });
    return () => { alive = false; };
  }, [initialExpertise]);

  const [handle, setHandle] = useState(initial.handle);
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [byline, setByline] = useState(initial.byline ?? '');
  const [bio, setBio] = useState(initial.bio);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initial.avatarUrl);
  const [isPrivate, setIsPrivate] = useState(initial.isProfilePrivate);
  const [showActivity, setShowActivity] = useState(initial.showActivity);

  const [availability, setAvailability] = useState<AvailabilityState>({ status: 'same' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (handle === initial.handle) { setAvailability({ status: 'same' }); return; }
    setAvailability({ status: 'checking' });
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/community/users/me/handle-availability?candidate=${encodeURIComponent(handle)}`);
      const j = (await res.json()) as { success: boolean; data?: { available: boolean; reason?: string; nextAvailableAt?: string } };
      if (!j.success || !j.data) { setAvailability({ status: 'idle' }); return; }
      if (j.data.available) { setAvailability({ status: 'available' }); return; }
      const reasonMap: Record<string, AvailabilityState['status']> = { TAKEN: 'taken', INVALID_FORMAT: 'invalid', RESERVED: 'reserved', THROTTLED: 'throttled' };
      setAvailability({ status: reasonMap[j.data.reason ?? ''] ?? 'idle', nextAvailableAt: j.data.nextAvailableAt });
    }, 250);
    return () => clearTimeout(timer);
  }, [handle, initial.handle]);

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/community/upload', { method: 'POST', credentials: 'include', body: fd });
    setUploading(false);
    if (res.ok) {
      const j = (await res.json()) as { success: boolean; data?: { url: string } };
      if (j.success && j.data) setAvatarUrl(j.data.url);
    }
  };

  const save = async () => {
    setSaving(true); setError(null); setSuccess(false);
    const body: Record<string, unknown> = {
      displayName,
      bio,
      byline: byline.trim() ? byline.trim() : null,
      avatarUrl,
      isProfilePrivate: isPrivate,
      showActivity,
    };
    if (handle !== initial.handle) body.handle = handle;

    const res = await fetch('/api/community/users/me', {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => null)) as null | { error?: { code?: string; message?: string; nextAvailableAt?: string } };
      const code = j?.error?.code;
      if (code === 'HANDLE_TAKEN') setError('Handle is already taken.');
      else if (code === 'HANDLE_CHANGE_THROTTLED') setError(`Handle change throttled — next allowed at ${j?.error?.nextAvailableAt}.`);
      else if (code === 'RESERVED_HANDLE') setError('That handle is reserved.');
      else if (code === 'INVALID_HANDLE_FORMAT') setError('Handle must be 3–30 lowercase chars, [a-z0-9_-], starting with a letter.');
      else setError(j?.error?.message ?? `Failed (${res.status})`);
      return;
    }
    setSuccess(true);
    const j = (await res.json()) as { success: boolean; data: { handle: string } };
    if (j.data.handle !== initial.handle) {
      window.location.href = `/community/u/${encodeURIComponent(j.data.handle)}/edit`;
    }
  };

  const availabilityIcon = () => {
    switch (availability.status) {
      case 'available': return <span className="text-emerald-600">✓ Available</span>;
      case 'taken': return <span className="text-destructive">✗ Taken</span>;
      case 'invalid': return <span className="text-destructive">✗ Invalid format</span>;
      case 'reserved': return <span className="text-destructive">✗ Reserved</span>;
      case 'throttled': return <span className="text-amber-700">🕒 Throttled until {availability.nextAvailableAt?.slice(0, 10)}</span>;
      case 'checking': return <span className="text-slate-400">…</span>;
      case 'same': return null;
      default: return null;
    }
  };

  const canSave = availability.status === 'available' || availability.status === 'same';

  return (
    <main className="mx-auto max-w-xl px-6 py-6">
      <h1 className="mb-4 text-2xl font-bold">Edit profile</h1>

      <Label className="mt-3 block">Avatar</Label>
      <div className="mt-1 flex items-center gap-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" width={64} height={64} className="size-16 rounded-lg object-cover" />
        ) : (
          <div className="size-16 rounded-lg bg-muted" />
        )}
        <label className="inline-flex cursor-pointer items-center rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs transition-colors hover:bg-accent">
          {uploading ? 'Uploading…' : 'Upload new'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadAvatar(f); }}
          />
        </label>
        {avatarUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAvatarUrl(null)}
            className="text-destructive hover:text-destructive"
          >
            Remove
          </Button>
        )}
      </div>

      <div className="mt-4 space-y-1.5">
        <Label htmlFor="profile-display-name">Display name</Label>
        <Input
          id="profile-display-name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={200}
        />
      </div>

      <div className="mt-4 space-y-1.5">
        <Label htmlFor="profile-handle">Handle</Label>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">@</span>
          <Input
            id="profile-handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value.toLowerCase())}
            maxLength={30}
            pattern="[a-z][a-z0-9_-]+"
            className="flex-1"
          />
        </div>
        <div className="min-h-[18px] text-xs">{availabilityIcon()}</div>
        <div className="text-[11px] text-slate-400">Can change once every 30 days.</div>
      </div>

      <div className="mt-4 space-y-1.5">
        <Label htmlFor="profile-byline">Byline (optional)</Label>
        <Input
          id="profile-byline"
          value={byline}
          onChange={(e) => setByline(e.target.value)}
          maxLength={200}
        />
      </div>

      <div className="mt-4 space-y-1.5">
        <Label htmlFor="profile-bio">Bio</Label>
        <Textarea
          id="profile-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          maxLength={2000}
        />
      </div>

      <fieldset className="mt-4 border-0 p-0">
        <legend className="text-sm font-semibold">Privacy</legend>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <Checkbox
            checked={isPrivate}
            onCheckedChange={(v) => setIsPrivate(v === true)}
          />
          Private profile (only signed-in community members can view)
        </label>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <Checkbox
            checked={showActivity}
            onCheckedChange={(v) => setShowActivity(v === true)}
          />
          Show recent activity on profile
        </label>
      </fieldset>

      <section className="mt-6 border-t pt-4">
        <h2 className="mb-2 text-base font-semibold">Expertise</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Topics you cover. Helps others discover you in the experts directory.
        </p>
        {expertise === null ? (
          <div className="text-xs text-slate-400">Loading…</div>
        ) : (
          <ExpertiseEditor initial={expertise} />
        )}
      </section>

      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
      {success && !error && <p className="mt-3 text-xs text-emerald-600">Saved.</p>}

      <div className="mt-6 flex gap-2">
        <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={saving}>
          Cancel
        </Button>
        <Button type="button" onClick={save} disabled={saving || !canSave}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </main>
  );
}
