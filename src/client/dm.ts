import type { ClientCtx } from './index';
import type { DmConversation, DmMessage } from '../types';
import { jsonOrThrow } from './pitches';

export async function listConversations(ctx: ClientCtx): Promise<DmConversation[]> {
  const res = await ctx.fetch(`${ctx.base}/api/community/dm/conversations`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await jsonOrThrow<{ conversations: DmConversation[] }>(res, 'DM_CONVERSATIONS_FAILED');
  return data.conversations;
}

export async function listRequests(ctx: ClientCtx): Promise<DmConversation[]> {
  const res = await ctx.fetch(`${ctx.base}/api/community/dm/requests`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await jsonOrThrow<{ conversations: DmConversation[] }>(res, 'DM_REQUESTS_FAILED');
  return data.conversations;
}

export async function acceptConversation(ctx: ClientCtx, conversationId: string): Promise<void> {
  const res = await ctx.fetch(
    `${ctx.base}/api/community/dm/conversations/${encodeURIComponent(conversationId)}/accept`,
    { method: 'POST', credentials: 'include' },
  );
  await jsonOrThrow<unknown>(res, 'DM_ACCEPT_FAILED');
}

export async function declineConversation(ctx: ClientCtx, conversationId: string): Promise<void> {
  const res = await ctx.fetch(
    `${ctx.base}/api/community/dm/conversations/${encodeURIComponent(conversationId)}/decline`,
    { method: 'POST', credentials: 'include' },
  );
  await jsonOrThrow<unknown>(res, 'DM_DECLINE_FAILED');
}

export async function hideConversation(ctx: ClientCtx, conversationId: string): Promise<void> {
  const res = await ctx.fetch(
    `${ctx.base}/api/community/dm/conversations/${encodeURIComponent(conversationId)}/hide`,
    { method: 'POST', credentials: 'include' },
  );
  await jsonOrThrow<unknown>(res, 'DM_HIDE_FAILED');
}

export async function listDmMessages(
  ctx: ClientCtx,
  conversationId: string,
  params?: { before?: string; limit?: number },
): Promise<DmMessage[]> {
  const qs = new URLSearchParams();
  if (params?.before) qs.set('before', params.before);
  if (params?.limit !== undefined) qs.set('limit', String(params.limit));
  const query = qs.toString();
  const url = `${ctx.base}/api/community/dm/conversations/${encodeURIComponent(conversationId)}/messages${query ? `?${query}` : ''}`;
  const res = await ctx.fetch(url, { method: 'GET', credentials: 'include' });
  const data = await jsonOrThrow<{ messages: DmMessage[] }>(res, 'DM_MESSAGES_FAILED');
  return data.messages;
}

export interface SendDmInput {
  /** Community user ID of the recipient */
  peerId: string;
  body: string;
  attachmentIds?: string[];
}

export async function sendDm(
  ctx: ClientCtx,
  input: SendDmInput,
): Promise<{ conversationId: string; messageId: string; status: 'pending' | 'accepted' }> {
  const res = await ctx.fetch(`${ctx.base}/api/community/dm/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  return jsonOrThrow<{ conversationId: string; messageId: string; status: 'pending' | 'accepted' }>(
    res,
    'DM_SEND_FAILED',
  );
}

export async function softDeleteDm(
  ctx: ClientCtx,
  messageId: string,
  reason: 'spam' | 'abuse' | 'off-topic' | 'admin' | 'author' = 'author',
): Promise<void> {
  const res = await ctx.fetch(
    `${ctx.base}/api/community/dm/messages/${encodeURIComponent(messageId)}/delete`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reason }),
    },
  );
  await jsonOrThrow<unknown>(res, 'DM_DELETE_FAILED');
}

export async function blockUser(
  ctx: ClientCtx,
  blockedId: string,
  reason?: string,
): Promise<{ alreadyBlocked: boolean }> {
  const res = await ctx.fetch(`${ctx.base}/api/community/dm/blocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ blockedId, ...(reason ? { reason } : {}) }),
  });
  return jsonOrThrow<{ alreadyBlocked: boolean }>(res, 'DM_BLOCK_FAILED');
}

export async function unblockUser(
  ctx: ClientCtx,
  blockedId: string,
): Promise<{ removed: boolean }> {
  const res = await ctx.fetch(
    `${ctx.base}/api/community/dm/blocks/${encodeURIComponent(blockedId)}`,
    { method: 'DELETE', credentials: 'include' },
  );
  return jsonOrThrow<{ removed: boolean }>(res, 'DM_UNBLOCK_FAILED');
}

export function openDmStream(ctx: ClientCtx): EventSource {
  return new EventSource(`${ctx.base}/api/community/dm/stream`, { withCredentials: true });
}
