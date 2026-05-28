'use client';
import { useRef, useState } from 'react';
import { Paperclip, Smile, AtSign, Send, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '../primitives/cn';

interface MessageComposerProps {
  canPost: boolean;
  reason?: string;
  placeholder?: string;
  onSend: (body: string, attachmentIds: string[]) => Promise<boolean>;
}

export function MessageComposer({
  canPost,
  reason,
  placeholder = 'Type a message…',
  onSend,
}: MessageComposerProps) {
  const [body, setBody] = useState('');
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<Array<{ id: string; url: string }>>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!body.trim() && attachments.length === 0) return;
    setPending(true);
    const ok = await onSend(body.trim(), attachments.map((a) => a.id));
    setPending(false);
    if (ok) {
      setBody('');
      setAttachments([]);
      textRef.current?.focus();
    }
  };

  const handleAttach = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/community/upload', {
      method: 'POST',
      credentials: 'include',
      body: fd,
    });
    setUploading(false);
    if (res.ok) {
      const j = (await res.json()) as {
        success: boolean;
        data?: { attachmentId: string; url: string };
      };
      if (j.success && j.data) {
        setAttachments((prev) => [...prev, { id: j.data!.attachmentId, url: j.data!.url }]);
      }
    }
  };

  const insertAtMention = () => {
    setBody((b) => `${b}${b.endsWith(' ') || b === '' ? '' : ' '}@`);
    textRef.current?.focus();
  };

  if (!canPost) {
    return (
      <div className="border-t bg-muted/30 px-5 py-3 text-center text-xs text-muted-foreground">
        {reason ?? 'You cannot post in this channel.'}
      </div>
    );
  }

  const canSend = !pending && (body.trim() !== '' || attachments.length > 0);

  return (
    <div className="border-t bg-card/30 px-4 py-3">
      {/* Attachment chips */}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((a) => (
            <div
              key={a.id}
              className="group inline-flex items-center gap-1.5 rounded-md border bg-background pl-1.5 pr-1 py-1 text-xs"
            >
              <ImageIcon className="size-3 text-muted-foreground" aria-hidden />
              <span className="max-w-[120px] truncate text-foreground/80">
                {a.url.split('/').pop()}
              </span>
              <button
                type="button"
                aria-label="Remove attachment"
                onClick={() => setAttachments((prev) => prev.filter((p) => p.id !== a.id))}
                className="flex size-4 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Composer surface */}
      <div className="flex items-end gap-2 rounded-2xl border bg-background px-3 py-2 shadow-sm transition-shadow focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
        <textarea
          ref={textRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder={placeholder}
          rows={1}
          className={cn(
            'min-h-[20px] flex-1 resize-none border-none bg-transparent px-1 py-1.5 text-sm placeholder:text-muted-foreground',
            'focus-visible:outline-none',
            'max-h-32 overflow-y-auto',
          )}
        />

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleAttach(f);
            e.target.value = '';
          }}
        />

        {/* Action toolbar */}
        <div className="flex items-center gap-0.5 self-center">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || attachments.length >= 4}
            aria-label="Attach image"
            title="Attach"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
          >
            <Paperclip className="size-4" />
          </button>
          <button
            type="button"
            onClick={insertAtMention}
            aria-label="Insert mention"
            title="Mention"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <AtSign className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Emoji"
            title="Emoji (coming soon)"
            disabled
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground/40"
          >
            <Smile className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send"
            title="Send"
            className={cn(
              'ml-0.5 flex size-8 items-center justify-center rounded-lg transition-all',
              canSend
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95'
                : 'bg-muted text-muted-foreground',
            )}
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>

      <p className="mt-1.5 px-1 text-[10px] text-muted-foreground">
        Press <kbd className="rounded border bg-muted px-1 font-mono">Enter</kbd> to send,{' '}
        <kbd className="rounded border bg-muted px-1 font-mono">Shift + Enter</kbd> for a new line
      </p>
    </div>
  );
}
