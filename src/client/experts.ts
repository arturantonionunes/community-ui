import type { ClientCtx } from './index';
import type { ExpertSummary, ExpertiseTag } from '../types';
import { jsonOrThrow } from './pitches';

export interface SearchExpertsParams {
  tag?: string;
  q?: string;
  verified?: boolean;
  limit?: number;
  offset?: number;
}

export async function searchExperts(
  ctx: ClientCtx,
  params: SearchExpertsParams,
): Promise<ExpertSummary[]> {
  const qs = new URLSearchParams();
  if (params.tag) qs.set('tag', params.tag);
  if (params.q) qs.set('q', params.q);
  if (params.verified !== undefined) qs.set('verified', String(params.verified));
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  if (params.offset !== undefined) qs.set('offset', String(params.offset));
  const query = qs.toString();
  const url = `${ctx.base}/api/community/experts${query ? `?${query}` : ''}`;
  const res = await ctx.fetch(url, { method: 'GET', credentials: 'include' });
  const data = await jsonOrThrow<{ experts: ExpertSummary[] }>(res, 'EXPERTS_SEARCH_FAILED');
  return data.experts;
}

export async function listExpertise(ctx: ClientCtx): Promise<ExpertiseTag[]> {
  const res = await ctx.fetch(`${ctx.base}/api/community/users/me/expertise`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await jsonOrThrow<{ tags: ExpertiseTag[] }>(res, 'EXPERTISE_LIST_FAILED');
  return data.tags;
}

export async function replaceExpertise(
  ctx: ClientCtx,
  tags: Array<{ slug?: string; label: string; proficiency: number }>,
): Promise<void> {
  const res = await ctx.fetch(`${ctx.base}/api/community/users/me/expertise`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ tags }),
  });
  await jsonOrThrow<unknown>(res, 'EXPERTISE_REPLACE_FAILED');
}

export async function removeExpertise(ctx: ClientCtx, slug: string): Promise<void> {
  const res = await ctx.fetch(
    `${ctx.base}/api/community/users/me/expertise/${encodeURIComponent(slug)}`,
    { method: 'DELETE', credentials: 'include' },
  );
  await jsonOrThrow<unknown>(res, 'EXPERTISE_REMOVE_FAILED');
}
