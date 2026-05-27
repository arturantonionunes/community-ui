import type { ClientCtx } from './index';
import { jsonOrThrow } from './pitches';

export async function uploadImage(
  ctx: ClientCtx,
  file: File,
): Promise<{ attachmentId: string; url: string; width: number | null; height: number | null }> {
  const form = new FormData();
  form.append('file', file);
  const res = await ctx.fetch(`${ctx.base}/api/community/upload`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  return jsonOrThrow<{ attachmentId: string; url: string; width: number | null; height: number | null }>(
    res,
    'UPLOAD_FAILED',
  );
}
