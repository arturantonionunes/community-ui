import type { ClientCtx } from './index';
import { jsonOrThrow } from './pitches';

export interface SubmitTipInput {
  storySummary: string;
  context?: string;
  contactPref?: 'email' | 'community-dm' | 'signal' | 'none';
  contactValue?: string;
  prefersAnonymousPublish?: boolean;
}

export async function submitTip(
  ctx: ClientCtx,
  input: SubmitTipInput,
): Promise<{ id: string }> {
  const res = await ctx.fetch(`${ctx.base}/api/community/tips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  return jsonOrThrow<{ id: string }>(res, 'TIP_SUBMIT_FAILED');
}
