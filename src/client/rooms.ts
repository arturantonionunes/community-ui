import type { ClientCtx } from './index';
import type { RoomSummary, ChatMessage } from '../types';
import { jsonOrThrow } from './pitches';

export async function listVisibleRooms(ctx: ClientCtx): Promise<RoomSummary[]> {
  const res = await ctx.fetch(`${ctx.base}/api/community/rooms`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await jsonOrThrow<{ rooms: RoomSummary[] }>(res, 'ROOMS_LIST_FAILED');
  return data.rooms;
}

export async function listRoomMessages(
  ctx: ClientCtx,
  slug: string,
  params?: { before?: string; limit?: number },
): Promise<ChatMessage[]> {
  const qs = new URLSearchParams();
  if (params?.before) qs.set('before', params.before);
  if (params?.limit !== undefined) qs.set('limit', String(params.limit));
  const query = qs.toString();
  const url = `${ctx.base}/api/community/rooms/${encodeURIComponent(slug)}/messages${query ? `?${query}` : ''}`;
  const res = await ctx.fetch(url, { method: 'GET', credentials: 'include' });
  const data = await jsonOrThrow<{ messages: ChatMessage[] }>(res, 'ROOM_MESSAGES_FAILED');
  return data.messages;
}

export async function postRoomMessage(
  ctx: ClientCtx,
  slug: string,
  body: string,
  attachmentIds?: string[],
): Promise<{ id: string; createdAt: string }> {
  const res = await ctx.fetch(
    `${ctx.base}/api/community/rooms/${encodeURIComponent(slug)}/messages`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ body, ...(attachmentIds ? { attachmentIds } : {}) }),
    },
  );
  return jsonOrThrow<{ id: string; createdAt: string }>(res, 'ROOM_POST_FAILED');
}

export async function reportMessage(
  ctx: ClientCtx,
  messageId: string,
  reason: string,
): Promise<void> {
  const res = await ctx.fetch(
    `${ctx.base}/api/community/messages/${encodeURIComponent(messageId)}/report`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reason }),
    },
  );
  await jsonOrThrow<unknown>(res, 'MESSAGE_REPORT_FAILED');
}

export function openRoomStream(ctx: ClientCtx, slug: string): EventSource {
  return new EventSource(
    `${ctx.base}/api/community/rooms/${encodeURIComponent(slug)}/stream`,
    { withCredentials: true },
  );
}
