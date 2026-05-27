'use client';

export function PresenceList({ online, journalists }: { online: number; journalists: number }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold text-muted-foreground">ONLINE ({online})</div>
      <div className="text-xs text-slate-400">
        {journalists} verified journalist{journalists === 1 ? '' : 's'}
      </div>
    </div>
  );
}
