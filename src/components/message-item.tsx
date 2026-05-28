'use client';
import { useState } from 'react';
import { ReportDialog } from './report-dialog';
import { Avatar } from '../primitives/avatar';

export interface ChatMessage {
  id: string;
  createdAt: string;
  author: { id: string; displayName: string; avatarUrl: string | null; isVerified: boolean };
  body: string;
  isDeleted?: boolean;
  attachments: Array<{ id: string; url: string; mimeType: string; widthPx: number | null; heightPx: number | null }>;
}

export function MessageItem({ message }: { message: ChatMessage }) {
  const [reportOpen, setReportOpen] = useState(false);
  return (
    <div className="flex gap-2 px-4 py-1.5">
      <Avatar src={message.author.avatarUrl} alt={message.author.displayName} fallback={message.author.displayName} size="xs" />
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted-foreground">
          <strong className="text-foreground">{message.author.displayName}</strong>
          {message.author.isVerified && <span className="ml-1 text-amber-700">ⓥ</span>}
          <span className="ml-1.5">{new Date(message.createdAt).toLocaleTimeString()}</span>
          {!message.isDeleted && (
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="ml-2 cursor-pointer border-none bg-transparent text-[10px] text-slate-400 transition-colors duration-200 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Report
            </button>
          )}
        </div>
        {message.isDeleted ? (
          <div className="text-sm italic text-slate-400">[deleted by moderator]</div>
        ) : (
          <>
            <div className="whitespace-pre-wrap break-words text-sm">{message.body}</div>
            {message.attachments.length > 0 && (
              <div className="mt-1 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-1">
                {message.attachments.map((a) => (
                  <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer">
                    <img src={a.url} alt="" loading="lazy" className="max-h-60 max-w-full rounded-sm" />
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {reportOpen && <ReportDialog messageId={message.id} onClose={() => setReportOpen(false)} />}
    </div>
  );
}
