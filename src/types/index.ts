/**
 * Public types for the newsX Community module.
 * Mirrors server-side row shapes; Date fields are serialized to ISO strings at the API boundary.
 */

// ── Pitches ────────────────────────────────────────────────────

export type PitchStatus = 'open' | 'claimed' | 'in_progress' | 'published' | 'archived';

export interface PitchSummary {
  id: string;
  ownerId: string;
  ownerHandle: string;
  ownerDisplayName: string;
  ownerIsVerified: boolean;
  title: string;
  summary: string;
  status: PitchStatus;
  /** ISO 8601 string */
  deadlineAt: string | null;
  publishedUrl: string | null;
  tags: Array<{ slug: string; label: string }>;
  /** Count of pending claims */
  claimCount: number;
  /** ISO 8601 string */
  createdAt: string;
}

export interface PitchDetail extends PitchSummary {
  body: string;
  /** ISO 8601 string */
  archivedAt: string | null;
  /** ISO 8601 string */
  updatedAt: string;
  approvedClaimants: Array<{
    id: string;
    handle: string;
    displayName: string;
    isVerified: boolean;
  }>;
  pendingClaims?: PendingClaim[];
}

export interface PendingClaim {
  id: string;
  claimantId: string;
  claimantHandle: string;
  claimantDisplayName: string;
  note: string | null;
  /** ISO 8601 string */
  createdAt: string;
}

// ── Experts ────────────────────────────────────────────────────

export interface ExpertSummary {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  byline: string | null;
  isVerified: boolean;
  expertise: Array<{ slug: string; label: string; proficiency: number }>;
}

export interface ExpertiseTag {
  slug: string;
  label: string;
  proficiency: number;
}

export interface Topic {
  slug: string;
  label: string;
  usageCount: number;
}

// ── Profiles ───────────────────────────────────────────────────

export type Provider = 'the-wire' | 'pressx' | 'austrianewsroom';

export interface ProfileView {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  byline: string | null;
  bio: string;
  isVerifiedJournalist: boolean;
  verifiedCardTier: 'basic' | 'editorial' | null;
  primaryProvider: Provider;
  /** ISO 8601 string */
  joinedAt: string;
  /** ISO 8601 string */
  lastSeenAt: string | null;
  isProfilePrivate: boolean;
  showActivity: boolean;
  /** ISO 8601 string */
  handleChangedAt: string | null;
}

export interface IdentityLink {
  provider: Provider;
  /** ISO 8601 string */
  linkedAt: string;
}

export interface ActivityItem {
  id: string;
  roomSlug: string;
  roomName: string;
  body: string;
  /** ISO 8601 string */
  createdAt: string;
}

// ── Chat ───────────────────────────────────────────────────────

export interface MessageAttachment {
  id: string;
  url: string;
  mimeType: string;
  widthPx: number | null;
  heightPx: number | null;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  /** ISO 8601 string */
  createdAt: string;
  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    isVerified: boolean;
  };
  body: string;
  isDeleted: boolean;
  deleteReason: string | null;
  attachments: MessageAttachment[];
}

export interface RoomSummary {
  id: string;
  slug: string;
  name: string;
  description: string;
  isVerifiedOnly: boolean;
  visibility: 'public' | 'archived';
  sortOrder: number;
}

// ── Direct Messages ────────────────────────────────────────────

/**
 * Hydrated inbox/request entry — peer profile included.
 * This matches the DmInboxEntry shape returned by the API.
 */
export interface DmConversation {
  id: string;
  peer: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    isVerified: boolean;
  };
  lastMessage: {
    id: string;
    body: string;
    /** ISO 8601 string */
    createdAt: string;
    authorId: string;
  } | null;
  unreadCount: number;
}

export interface DmMessage {
  id: string;
  conversationId: string;
  authorId: string;
  body: string;
  isDeleted: boolean;
  /** ISO 8601 string */
  createdAt: string;
  attachments: Array<{
    id: string;
    url: string;
    mimeType: string;
    widthPx: number | null;
    heightPx: number | null;
  }>;
}

// ── Tips ───────────────────────────────────────────────────────

export interface TipSummary {
  id: string;
  submittedById: string;
  submitter: { handle: string; displayName: string };
  prefersAnonymousPublish: boolean;
  storySummary: string;
  context: string | null;
  contactPref: string | null;
  contactValue: string | null;
  status: 'pending' | 'reviewing' | 'actioned' | 'dismissed';
  assignedToUserId: string | null;
  internalNotes: string | null;
  /** ISO 8601 string */
  createdAt: string;
}

// ── Session / Auth ─────────────────────────────────────────────

export interface CommunitySession {
  communityUserId: string;
  handle: string;
}

export interface LinkConflictPayload {
  pendingToken: string;
  existingProfileSummary: {
    displayName: string;
    primaryProvider: Provider;
    isVerified: boolean;
  };
}
