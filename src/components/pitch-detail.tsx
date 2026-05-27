'use client';
import Link from 'next/link';
import type { PitchDetail as PitchDetailType } from '../types';
import { ProfileSendMessageButton } from './profile-send-message-button';
import { ClaimRequestButton } from './claim-request-button';
import { ClaimList } from './claim-list';

const STATUS_COLOR: Record<string, string> = {
  open: '#10b981',
  claimed: '#f59e0b',
  in_progress: '#3b82f6',
  published: '#8b5cf6',
  archived: '#9ca3af',
};

interface PitchDetailProps {
  pitch: PitchDetailType;
  viewerCommunityUserId: string | null;
}

export function PitchDetail({ pitch, viewerCommunityUserId }: PitchDetailProps) {
  const color = STATUS_COLOR[pitch.status] ?? '#9ca3af';
  const isOwner = viewerCommunityUserId === pitch.ownerId;
  const viewerCanClaim = !!viewerCommunityUserId && !isOwner;

  return (
    <article className="flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-foreground">{pitch.title}</h1>
          <span
            className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize text-white"
            style={{ background: color }}
          >
            {pitch.status.replace('_', ' ')}
          </span>
        </div>
        {pitch.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {pitch.tags.map((t) => (
              <Link
                key={t.slug}
                href={`/community/pitches?tag=${encodeURIComponent(t.slug)}`}
                className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                #{t.label}
              </Link>
            ))}
          </div>
        )}
        {pitch.deadlineAt && (
          <div className="text-xs text-muted-foreground">
            Deadline: {new Date(pitch.deadlineAt).toLocaleString()}
          </div>
        )}
        {pitch.publishedUrl && (
          <div className="text-sm">
            Published:{' '}
            <a
              href={pitch.publishedUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-primary underline-offset-4 hover:underline"
            >
              {pitch.publishedUrl}
            </a>
          </div>
        )}
      </header>

      <section>
        <div className="mb-1 text-base font-semibold text-foreground">Summary</div>
        <div className="whitespace-pre-wrap text-sm text-foreground">{pitch.summary}</div>
      </section>

      {pitch.body && (
        <section>
          <div className="mb-1 text-base font-semibold text-foreground">Details</div>
          <div className="whitespace-pre-wrap text-sm text-foreground">{pitch.body}</div>
        </section>
      )}

      <section className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
        <div
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground"
        >
          {pitch.ownerDisplayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            {pitch.ownerDisplayName}
            {pitch.ownerIsVerified && (
              <span className="text-xs text-primary" title="Verified journalist">
                ✓
              </span>
            )}
          </div>
          <Link
            href={`/community/u/${pitch.ownerHandle}`}
            className="text-xs text-muted-foreground no-underline hover:underline"
          >
            @{pitch.ownerHandle}
          </Link>
        </div>
        {viewerCommunityUserId && !isOwner && (
          <ProfileSendMessageButton
            peerId={pitch.ownerId}
            peerHandle={pitch.ownerHandle}
            peerDisplayName={pitch.ownerDisplayName}
            peerIsVerified={pitch.ownerIsVerified}
            peerByline={null}
          />
        )}
      </section>

      {viewerCanClaim && (
        <section>
          <ClaimRequestButton pitchId={pitch.id} />
        </section>
      )}

      {isOwner && pitch.pendingClaims && pitch.pendingClaims.length > 0 && (
        <section>
          <ClaimList
            pitchId={pitch.id}
            pendingClaims={pitch.pendingClaims.map((c) => ({
              id: c.id,
              claimantId: c.claimantId,
              claimantHandle: c.claimantHandle,
              claimantDisplayName: c.claimantDisplayName,
              note: c.note,
              createdAt: c.createdAt,
            }))}
          />
        </section>
      )}

      {isOwner && (
        <div>
          <Link
            href={`/community/pitches/${pitch.id}/edit`}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Edit pitch
          </Link>
        </div>
      )}
    </article>
  );
}
