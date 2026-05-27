'use client';
import { useEffect, useState } from 'react';
import { Button } from '../primitives/button';
import { Input } from '../primitives/input';
import { Textarea } from '../primitives/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../primitives/dialog';

interface SearchedUser {
  id: string;
  displayName: string;
  byline: string | null;
  isVerified: boolean;
}

interface NewMessageDialogProps {
  onClose: () => void;
  onSent: (conversationId: string) => void;
  initialPeer?: { id: string; displayName: string; isVerified: boolean; byline?: string | null };
}

export function NewMessageDialog({ onClose, onSent, initialPeer }: NewMessageDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(
    initialPeer
      ? { id: initialPeer.id, displayName: initialPeer.displayName, isVerified: initialPeer.isVerified, byline: initialPeer.byline ?? null }
      : null
  );
  const [body, setBody] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedUser || query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      void fetch(`/api/community/dm/users/search?q=${encodeURIComponent(query)}`, { credentials: 'include' })
        .then((r) => r.json())
        .then((j) => { if (j.success) setResults(j.data.users); })
        .catch(() => {});
    }, 250);
    return () => clearTimeout(timer);
  }, [query, selectedUser]);

  const send = async () => {
    if (!selectedUser || !body.trim()) return;
    setPending(true); setError(null);
    const res = await fetch('/api/community/dm/conversations', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peerId: selectedUser.id, body: body.trim() }),
    });
    setPending(false);
    if (!res.ok) {
      const j = await res.json().catch(() => null as null | { error?: { message?: string } });
      setError(j?.error?.message ?? `Failed (${res.status})`);
      return;
    }
    const j = (await res.json()) as { success: boolean; data?: { conversationId: string } };
    if (j.success && j.data) onSent(j.data.conversationId);
  };

  return (
    <Dialog open onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New direct message</DialogTitle>
        </DialogHeader>
        {!selectedUser ? (
          <>
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or byline…"
            />
            <ul className="m-0 max-h-60 list-none overflow-y-auto p-0">
              {results.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(u)}
                    className="w-full cursor-pointer border-none bg-transparent px-1.5 py-1.5 text-left text-sm hover:bg-accent/50"
                  >
                    {u.displayName}
                    {u.isVerified && <span className="ml-1 text-amber-700">ⓥ</span>}
                    {u.byline && <span className="ml-1.5 text-slate-400">{u.byline}</span>}
                  </button>
                </li>
              ))}
              {query.length >= 2 && results.length === 0 && (
                <li className="p-1.5 text-xs text-slate-400">No matches.</li>
              )}
            </ul>
          </>
        ) : (
          <>
            <div className="text-sm">
              To: <strong>{selectedUser.displayName}</strong>
              {selectedUser.isVerified && <span className="ml-1 text-amber-700">ⓥ</span>}
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => setSelectedUser(null)}
                className="ml-2 h-auto p-0 text-[10px] text-muted-foreground"
              >
                change
              </Button>
            </div>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Write your message…"
              className="resize-none"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          {selectedUser && (
            <Button type="button" onClick={send} disabled={pending || !body.trim()}>
              {pending ? 'Sending…' : 'Send'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
