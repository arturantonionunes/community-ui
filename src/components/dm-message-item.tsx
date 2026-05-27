'use client';
import { cn } from '../primitives/cn';

export interface DmMessageView {
  id: string;
  authorId: string;
  body: string;
  isDeleted?: boolean;
  createdAt: string;
  attachments: Array<{ id: string; url: string; widthPx: number | null; heightPx: number | null }>;
}

export function DmMessageItem({ message, meId, peerName }: { message: DmMessageView; meId: string; peerName: string }) {
  const isMine = message.authorId === meId;
  return (
    <div className={cn('flex px-4 py-1.5', isMine ? 'justify-end' : 'justify-start')}>
      <div className="max-w-[70%]">
        {!isMine && <div className="mb-0.5 text-[11px] text-muted-foreground">{peerName}</div>}
        {message.isDeleted ? (
          <div className="text-sm italic text-slate-400">[deleted]</div>
        ) : (
          <>
            <div
              className={cn(
                'whitespace-pre-wrap rounded-xl px-2.5 py-1.5 text-sm',
                isMine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
              )}
            >
              {message.body}
            </div>
            {message.attachments.length > 0 && (
              <div className="mt-1 grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-1">
                {message.attachments.map((a) => (
                  <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer">
                    <img src={a.url} alt="" loading="lazy" className="max-h-[200px] max-w-full rounded-sm" />
                  </a>
                ))}
              </div>
            )}
          </>
        )}
        <div className={cn('mt-0.5 text-[10px] text-slate-400', isMine ? 'text-right' : 'text-left')}>
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
