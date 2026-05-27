import type { ClientCtx } from './index';
import type { ProfileView, IdentityLink, ActivityItem, ExpertiseTag } from '../types';
import { jsonOrThrow } from './pitches';

export interface FullProfileResponse extends ProfileView {
  identityLinks: IdentityLink[];
  recentActivity: ActivityItem[] | null;
  showActivity: boolean;
  canEdit: boolean;
}

export async function getProfileByHandle(
  ctx: ClientCtx,
  handle: string,
): Promise<FullProfileResponse | null> {
  const res = await ctx.fetch(
    `${ctx.base}/api/community/users/by-handle/${encodeURIComponent(handle)}`,
    { method: 'GET', credentials: 'include' },
  );
  if (res.status === 404) return null;
  const data = await jsonOrThrow<FullProfileResponse>(res, 'PROFILE_GET_FAILED');
  return data;
}

/** Returns identity links embedded in the profile response. */
export async function listIdentityLinks(
  ctx: ClientCtx,
  handle: string,
): Promise<IdentityLink[]> {
  const profile = await getProfileByHandle(ctx, handle);
  if (!profile) return [];
  return profile.identityLinks;
}

/** Returns per-handle expertise tags from /by-handle/[handle]/expertise. */
export async function listHandleExpertise(
  ctx: ClientCtx,
  handle: string,
): Promise<ExpertiseTag[]> {
  const res = await ctx.fetch(
    `${ctx.base}/api/community/users/by-handle/${encodeURIComponent(handle)}/expertise`,
    { method: 'GET', credentials: 'include' },
  );
  if (res.status === 404) return [];
  const data = await jsonOrThrow<{ tags: ExpertiseTag[] }>(res, 'PROFILE_EXPERTISE_FAILED');
  return data.tags;
}

export async function getProfileActivity(
  ctx: ClientCtx,
  handle: string,
  params?: { before?: string; limit?: number },
): Promise<{ messages: ActivityItem[]; nextCursor: string | null }> {
  const qs = new URLSearchParams();
  if (params?.before) qs.set('before', params.before);
  if (params?.limit !== undefined) qs.set('limit', String(params.limit));
  const query = qs.toString();
  const url = `${ctx.base}/api/community/users/by-handle/${encodeURIComponent(handle)}/activity${query ? `?${query}` : ''}`;
  const res = await ctx.fetch(url, { method: 'GET', credentials: 'include' });
  return jsonOrThrow<{ messages: ActivityItem[]; nextCursor: string | null }>(res, 'PROFILE_ACTIVITY_FAILED');
}

export async function updateMyProfile(
  ctx: ClientCtx,
  patch: Partial<{
    handle: string;
    displayName: string;
    byline: string | null;
    bio: string;
    avatarUrl: string | null;
    isProfilePrivate: boolean;
    showActivity: boolean;
  }>,
): Promise<ProfileView> {
  const res = await ctx.fetch(`${ctx.base}/api/community/users/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(patch),
  });
  return jsonOrThrow<ProfileView>(res, 'PROFILE_UPDATE_FAILED');
}

export async function deleteMyAccount(ctx: ClientCtx): Promise<void> {
  const res = await ctx.fetch(`${ctx.base}/api/community/users/me`, {
    method: 'DELETE',
    credentials: 'include',
  });
  await jsonOrThrow<unknown>(res, 'PROFILE_DELETE_FAILED');
}

export async function getHandleAvailability(
  ctx: ClientCtx,
  handle: string,
): Promise<{ available: boolean; reason?: string; nextAvailableAt?: string }> {
  const qs = new URLSearchParams({ candidate: handle });
  const query = qs.toString();
  const res = await ctx.fetch(
    `${ctx.base}/api/community/users/me/handle-availability${query ? `?${query}` : ''}`,
    { method: 'GET', credentials: 'include' },
  );
  return jsonOrThrow<{ available: boolean; reason?: string; nextAvailableAt?: string }>(
    res,
    'HANDLE_AVAILABILITY_FAILED',
  );
}

/** Unlink an identity provider from the current user's account. */
export async function unlinkProvider(
  ctx: ClientCtx,
  provider: 'pressx' | 'austrianewsroom' | 'the-wire',
): Promise<{ remaining: number }> {
  const res = await ctx.fetch(
    `${ctx.base}/api/community/users/me/links/${encodeURIComponent(provider)}`,
    { method: 'DELETE', credentials: 'include' },
  );
  return jsonOrThrow<{ remaining: number }>(res, 'UNLINK_PROVIDER_FAILED');
}
