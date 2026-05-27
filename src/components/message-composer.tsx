'use client';
import { useRef, useState } from 'react';
import { Button } from '../primitives/button';
import { Textarea } from '../primitives/textarea';

interface MessageComposerProps {
  canPost: boolean;
  reason?: string;
  onSend: (body: string, attachmentIds: string[]) => Promise<boolean>;
}

export function MessageComposer({ canPost, reason, onSend }: MessageComposerProps) {
  const [body, setBody] = useState('');
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<Array<{ id: string; url: string }>>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!body.trim() && attachments.length === 0) return;
    setPending(true);
    const ok = await onSend(body.trim(), attachments.map((a) => a.id));
    setPending(false);
    if (ok) { setBody(''); setAttachments([]); }
  };

  const handleAttach = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/community/upload', { method: 'POST', credentials: 'include', body: fd });
    setUploading(false);
    if (res.ok) {
      const j = (await res.json()) as { success: boolean; data?: { attachmentId: string; url: string } };
      if (j.success && j.data) {
        setAttachments((prev) => [...prev, { id: j.data!.attachmentId, url: j.data!.url }]);
      }
    }
  };

  if (!canPost) {
    return (
      <div className="border-t p-3 text-xs text-muted-foreground">{reason}</div>
    );
  }

  return (
    <div className="border-t p-2">
      {attachments.length > 0 && (
        <div className="mb-1 text-[11px] text-muted-foreground">
          {attachments.length} image attached.{' '}
          <button
            type="button"
            onClick={() => setAttachments([])}
            className="cursor-pointer border-none bg-transparent text-destructive"
          >
            clear
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
          placeholder="Type a message…"
          rows={2}
          className="min-h-0 flex-1 resize-none"
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleAttach(f); }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || attachments.length >= 4}
          aria-label="Attach image"
        >
          📎
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSend}
          disabled={pending || (body.trim() === '' && attachments.length === 0)}
        >
          {pending ? 'Sending…' : 'Send'}
        </Button>
      </div>
    </div>
  );
}
