import { listPitches, getPitch, createPitch, updatePitch, archivePitch } from './pitches';
import { createClaim, decideClaim, withdrawClaim } from './claims';
import { searchExperts, listExpertise, replaceExpertise, removeExpertise } from './experts';
import { submitTip } from './tips';
import { searchTopics } from './topics';
import {
  listVisibleRooms, listRoomMessages, postRoomMessage, reportMessage, openRoomStream,
} from './rooms';
import {
  listConversations, listRequests, acceptConversation, declineConversation, hideConversation,
  listDmMessages, sendDm, softDeleteDm, blockUser, unblockUser, openDmStream,
} from './dm';
import {
  getProfileByHandle, listIdentityLinks, getProfileActivity,
  updateMyProfile, deleteMyAccount, getHandleAvailability,
} from './profiles';
import { uploadImage } from './upload';

export interface CommunityClientOptions {
  baseUrl: string;
  fetch?: typeof fetch;
  /**
   * Server-side rendering only — pass the incoming request's Cookie header
   * so server-side fetches into the same host carry the user's session.
   * Browser fetches use `credentials: 'include'` and don't need this.
   */
  cookieHeader?: string;
}

export interface ClientCtx {
  base: string;
  fetch: typeof fetch;
}

export function createCommunityClient(opts: CommunityClientOptions) {
  const baseFetch = opts.fetch ?? fetch;
  const cookieHeader = opts.cookieHeader;
  const wrappedFetch: typeof fetch = cookieHeader
    ? (input, init) => {
        const headers = new Headers(init?.headers);
        if (!headers.has('cookie')) headers.set('cookie', cookieHeader);
        return baseFetch(input, { ...init, headers });
      }
    : baseFetch;
  const base = opts.baseUrl.replace(/\/+$/, '');
  const ctx: ClientCtx = { base, fetch: wrappedFetch };

  return {
    pitches: {
      list: (params: Parameters<typeof listPitches>[1]) => listPitches(ctx, params),
      get: (id: string) => getPitch(ctx, id),
      create: (input: Parameters<typeof createPitch>[1]) => createPitch(ctx, input),
      update: (id: string, patch: Parameters<typeof updatePitch>[2]) => updatePitch(ctx, id, patch),
      archive: (id: string) => archivePitch(ctx, id),
    },
    claims: {
      create: (pitchId: string, note: string | null) => createClaim(ctx, pitchId, note),
      decide: (pitchId: string, claimId: string, action: 'approve' | 'reject', message?: string) =>
        decideClaim(ctx, pitchId, claimId, action, message),
      withdraw: (pitchId: string, claimId: string) => withdrawClaim(ctx, pitchId, claimId),
    },
    experts: {
      search: (params: Parameters<typeof searchExperts>[1]) => searchExperts(ctx, params),
      listExpertise: () => listExpertise(ctx),
      replaceExpertise: (tags: Parameters<typeof replaceExpertise>[1]) => replaceExpertise(ctx, tags),
      removeExpertise: (slug: string) => removeExpertise(ctx, slug),
    },
    tips: {
      submit: (input: Parameters<typeof submitTip>[1]) => submitTip(ctx, input),
    },
    topics: {
      search: (q: string, limit?: number) => searchTopics(ctx, q, limit),
    },
    rooms: {
      listVisible: () => listVisibleRooms(ctx),
      listMessages: (slug: string, params?: { before?: string; limit?: number }) =>
        listRoomMessages(ctx, slug, params),
      postMessage: (slug: string, body: string, attachmentIds?: string[]) =>
        postRoomMessage(ctx, slug, body, attachmentIds),
      report: (messageId: string, reason: string) => reportMessage(ctx, messageId, reason),
      openStream: (slug: string) => openRoomStream(ctx, slug),
    },
    dm: {
      listConversations: () => listConversations(ctx),
      listRequests: () => listRequests(ctx),
      accept: (conversationId: string) => acceptConversation(ctx, conversationId),
      decline: (conversationId: string) => declineConversation(ctx, conversationId),
      hide: (conversationId: string) => hideConversation(ctx, conversationId),
      listMessages: (conversationId: string, params?: { before?: string; limit?: number }) =>
        listDmMessages(ctx, conversationId, params),
      send: (input: Parameters<typeof sendDm>[1]) => sendDm(ctx, input),
      softDelete: (messageId: string) => softDeleteDm(ctx, messageId),
      block: (userId: string) => blockUser(ctx, userId),
      unblock: (blockedId: string) => unblockUser(ctx, blockedId),
      openStream: () => openDmStream(ctx),
    },
    profiles: {
      getByHandle: (handle: string) => getProfileByHandle(ctx, handle),
      listIdentityLinks: (handle: string) => listIdentityLinks(ctx, handle),
      activity: (handle: string, params?: { before?: string; limit?: number }) =>
        getProfileActivity(ctx, handle, params),
      updateMine: (patch: Parameters<typeof updateMyProfile>[1]) => updateMyProfile(ctx, patch),
      deleteMine: () => deleteMyAccount(ctx),
      handleAvailability: (handle: string) => getHandleAvailability(ctx, handle),
    },
    upload: {
      image: (file: File) => uploadImage(ctx, file),
    },
  };
}

export type CommunityClient = ReturnType<typeof createCommunityClient>;
