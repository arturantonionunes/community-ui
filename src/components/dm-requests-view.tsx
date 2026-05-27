'use client';
import { useEffect, useState } from 'react';
import { Button } from '../primitives/button';

interface RequestEntry {
  id: string;
  peer: { id: string; displayName: string; isVerified: boolean };
  lastMessage: { body: string; createdAt: string } | null;
}

export function DmRequestsView({ meId: _meId }: { meId: string }) {
  const [requests, setRequests] = useState<RequestEntry[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = () => {
    fetch('/api/community/dm/requests', { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => { if (j.success) setRequests(j.data.conversations); })
      .catch(() => {});
  };

  useEffect(() => { reload(); }, []);

  const decide = async (id: string, action: 'accept' | 'decline') => {
    setBusyId(id);
    await fetch(`/api/community/dm/conversations/${encodeURIComponent(id)}/${action}`, { method: 'POST', credentials: 'include' });
    setBusyId(null);
    reload();
  };

  return (
    <>
      <div className="border-b px-4 py-2 font-bold">Message requests</div>
      <div className="flex-1 overflow-y-auto p-2">
        {requests.length === 0 ? (
          <div className="p-4 text-sm text-slate-400">No pending requests.</div>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="mb-2 rounded-lg border p-3">
              <div className="text-sm font-semibold">
                {r.peer.displayName}
                {r.peer.isVerified && <span className="ml-1 text-[11px] text-amber-700">ⓥ</span>}
              </div>
              {r.lastMessage && (
                <div className="mt-1 text-xs text-slate-600">{r.lastMessage.body}</div>
              )}
              <div className="mt-2 flex gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => decide(r.id, 'accept')}
                  disabled={busyId === r.id}
                >
                  Accept
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => decide(r.id, 'decline')}
                  disabled={busyId === r.id}
                >
                  Decline
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
