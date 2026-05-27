import type { ClientCtx } from './index';
import type { Topic } from '../types';
import { jsonOrThrow } from './pitches';

export async function searchTopics(
  ctx: ClientCtx,
  q: string,
  limit?: number,
): Promise<Topic[]> {
  const qs = new URLSearchParams({ q });
  if (limit !== undefined) qs.set('limit', String(limit));
  const res = await ctx.fetch(
    `${ctx.base}/api/community/topics?${qs.toString()}`,
    { method: 'GET', credentials: 'include' },
  );
  const data = await jsonOrThrow<{ topics: Topic[] }>(res, 'TOPICS_SEARCH_FAILED');
  return data.topics;
}
