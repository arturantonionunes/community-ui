'use client';
import { useEffect, useState } from 'react';

interface UsePresenceOptions {
  roomSlug: string;
  baseUrl?: string;
  intervalMs?: number; // default 30000
}

interface PresentUser {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
}

export function usePresence({ roomSlug, baseUrl = '', intervalMs = 30000 }: UsePresenceOptions) {
  const [users, setUsers] = useState<PresentUser[]>([]);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      try {
        const res = await fetch(
          `${baseUrl}/api/community/presence?room=${encodeURIComponent(roomSlug)}`,
          { credentials: 'include' },
        );
        if (!res.ok) return;
        const json = await res.json();
        if (alive && json.success) setUsers(json.data.users);
      } catch {
        // network blip; retry on next tick
      } finally {
        if (alive) timer = setTimeout(tick, intervalMs);
      }
    };
    tick();
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, [roomSlug, baseUrl, intervalMs]);

  return users;
}
