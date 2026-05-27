import type { ClientCtx } from './index';
import { jsonOrThrow } from './pitches';

export async function createClaim(
  ctx: ClientCtx,
  pitchId: string,
  note: string | null,
): Promise<{ id: string }> {
  const res = await ctx.fetch(
    `${ctx.base}/api/community/pitches/${encodeURIComponent(pitchId)}/claims`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ note }),
    },
  );
  return jsonOrThrow<{ id: string }>(res, 'CLAIM_CREATE_FAILED');
}

export async function decideClaim(
  ctx: ClientCtx,
  pitchId: string,
  claimId: string,
  action: 'approve' | 'reject',
  message?: string,
): Promise<void> {
  const res = await ctx.fetch(
    `${ctx.base}/api/community/pitches/${encodeURIComponent(pitchId)}/claims/${encodeURIComponent(claimId)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action, ...(message !== undefined ? { message } : {}) }),
    },
  );
  await jsonOrThrow<unknown>(res, 'CLAIM_DECIDE_FAILED');
}

export async function withdrawClaim(
  ctx: ClientCtx,
  pitchId: string,
  claimId: string,
): Promise<void> {
  const res = await ctx.fetch(
    `${ctx.base}/api/community/pitches/${encodeURIComponent(pitchId)}/claims/${encodeURIComponent(claimId)}`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  );
  await jsonOrThrow<unknown>(res, 'CLAIM_WITHDRAW_FAILED');
}
