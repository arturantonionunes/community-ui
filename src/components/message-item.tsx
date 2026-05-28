'use client';
import { useState } from 'react';
import { Flag, BadgeCheck, FileText, ExternalLink } from 'lucide-react';
import { ReportDialog } from './report-dialog';
import { Avatar } from '../primitives/avatar';
import { cn } from '../primitives/cn';

export interface ChatMessage {
  id: string;
  createdAt: string;
  author: { id: string; displayName: string; avatarUrl: string | null; isVerified: boolean };
  body: string;
  isDeleted?: boolean;
  attachments: Array<{
    id: string;
    url: string;
    mimeType: string;
    widthPx: number | null;
    heightPx: number | null;
  }>;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Render body with @mentions and links highlighted.
 * @username → blue bold tag · https://... → blue underline
 */
function renderBody(body: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(@[a-zA-Z0-9_-]+)|((?:https?:\/\/)[^\s]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(body)) !== null) {
    if (m.index > last) parts.push(body.slice(last, m.index));
    const token = m[0];
    if (token.startsWith('@')) {
      parts.push(
        <span key={`m-${key++}`} className="font-semibold text-primary">
          {token}
        </span>,
      );
    } else {
      parts.push(
        <a
          key={`l-${key++}`}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-2 hover:underline"
        >
          {token}
        </a>,
      );
    }
    last = m.index + token.length;
  }
  if (last < body.length) parts.push(body.slice(last));
  return parts;
}

function isImage(mime: string): boolean {
  return mime.startsWith('image/');
}

export function MessageItem({ message }: { message: ChatMessage }) {
  const [reportOpen, setReportOpen] = useState(false);
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative flex gap-3 px-5 py-2 transition-colors hover:bg-accent/30"
    >
      <Avatar
        src={message.author.avatarUrl}
        alt={message.author.displayName}
        fallback={message.author.displayName}
        size="md"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <strong className="text-sm font-bold text-foreground">
            {message.author.displayName}
          </strong>
          {message.author.isVerified && (
            <BadgeCheck className="size-3.5 shrink-0 text-amber-500" aria-label="Verified" />
          )}
          <span className="text-xs text-muted-foreground">{formatTime(message.createdAt)}</span>
        </div>

        {message.isDeleted ? (
          <div className="mt-0.5 text-sm italic text-muted-foreground">
            [deleted by moderator]
          </div>
        ) : (
          <>
            <div className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">
              {renderBody(message.body)}
            </div>

            {message.attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.attachments.map((a) =>
                  isImage(a.mimeType) ? (
                    <a
                      key={a.id}
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block overflow-hidden rounded-lg border bg-card transition-opacity hover:opacity-95"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={a.url}
                        alt=""
                        loading="lazy"
                        className="block max-h-72 max-w-xs object-cover"
                      />
                    </a>
                  ) : (
                    <a
                      key={a.id}
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/file inline-flex items-center gap-2.5 rounded-lg border bg-card px-3 py-2 transition-colors hover:bg-accent/40"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <FileText className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block max-w-[180px] truncate text-xs font-semibold text-foreground">
                          {a.url.split('/').pop() ?? 'Attachment'}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          Open file
                        </span>
                      </span>
                      <ExternalLink
                        className="size-3.5 shrink-0 text-muted-foreground/60 transition-colors group-hover/file:text-foreground"
                        aria-hidden
                      />
                    </a>
                  ),
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Hover actions */}
      {!message.isDeleted && (
        <div
          className={cn(
            'absolute right-3 top-1.5 flex items-center gap-1 rounded-md border bg-card p-0.5 shadow-sm transition-opacity',
            hover ? 'opacity-100' : 'opacity-0',
          )}
        >
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            aria-label="Report message"
            title="Report"
            className="flex size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Flag className="size-3.5" />
          </button>
        </div>
      )}

      {reportOpen && (
        <ReportDialog messageId={message.id} onClose={() => setReportOpen(false)} />
      )}
    </div>
  );
}
