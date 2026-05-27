import type { ClientCtx } from './index';
import type { PitchSummary, PitchDetail, PitchStatus } from '../types';

export interface ListPitchesParams {
  status?: PitchStatus;
  tag?: string;
  q?: string;
  owner?: string;
  before?: string;
  limit?: number;
}

export async function jsonOrThrow<T>(res: Response, errCodePrefix: string): Promise<T> {
  if (!res.ok && res.status !== 404) {
    let code = errCodePrefix;
    try {
      const j = await res.clone().json();
      if (j?.error?.code) code = j.error.code;
    } catch { /* keep prefix */ }
    throw new Error(code);
  }
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.code ?? errCodePrefix);
  return json.data as T;
}

export async function listPitches(ctx: ClientCtx, params: ListPitchesParams): Promise<PitchSummary[]> {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.tag) qs.set('tag', params.tag);
  if (params.q) qs.set('q', params.q);
  if (params.owner) qs.set('owner', params.owner);
  if (params.before) qs.set('before', params.before);
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  const query = qs.toString();
  const url = `${ctx.base}/api/community/pitches${query ? `?${query}` : ''}`;
  const res = await ctx.fetch(url, { method: 'GET', credentials: 'include' });
  const data = await jsonOrThrow<{ pitches: PitchSummary[] }>(res, 'PITCHES_LIST_FAILED');
  return data.pitches;
}

export async function getPitch(ctx: ClientCtx, id: string): Promise<PitchDetail | null> {
  const res = await ctx.fetch(
    `${ctx.base}/api/community/pitches/${encodeURIComponent(id)}`,
    { method: 'GET', credentials: 'include' },
  );
  if (res.status === 404) return null;
  const data = await jsonOrThrow<{ pitch: PitchDetail }>(res, 'PITCH_GET_FAILED');
  return data.pitch;
}

export async function createPitch(
  ctx: ClientCtx,
  input: {
    title: string;
    summary: string;
    body?: string;
    tags?: Array<{ slug?: string; label: string }>;
    deadlineAt?: string | null;
  },
): Promise<{ id: string }> {
  const res = await ctx.fetch(`${ctx.base}/api/community/pitches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  return jsonOrThrow<{ id: string }>(res, 'PITCH_CREATE_FAILED');
}

export async function updatePitch(
  ctx: ClientCtx,
  id: string,
  patch: Partial<{
    title: string;
    summary: string;
    body: string;
    status: PitchStatus;
    publishedUrl: string | null;
    deadlineAt: string | null;
  }>,
): Promise<void> {
  const res = await ctx.fetch(`${ctx.base}/api/community/pitches/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(patch),
  });
  await jsonOrThrow<unknown>(res, 'PITCH_UPDATE_FAILED');
}

export async function archivePitch(ctx: ClientCtx, id: string): Promise<void> {
  const res = await ctx.fetch(`${ctx.base}/api/community/pitches/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  await jsonOrThrow<unknown>(res, 'PITCH_ARCHIVE_FAILED');
}
