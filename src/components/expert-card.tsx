'use client';
import Link from 'next/link';
import type { ExpertSummary } from '../types';
import { ProfileSendMessageButton } from './profile-send-message-button';
import { ExpertisePills } from './expertise-pills';
import { Button } from '../primitives/button';
import { Avatar } from '../primitives/avatar';

interface ExpertCardProps {
  expert: ExpertSummary;
  viewerCommunityUserId?: string | null;
}

export function ExpertCard({ expert, viewerCommunityUserId }: ExpertCardProps) {
  const topTags = (expert.expertise ?? []).slice(0, 3);
  const canMessage = !!viewerCommunityUserId && viewerCommunityUserId !== expert.id;

  return (
    <article className="flex items-start gap-3 rounded-xl border bg-card p-4">
      <Avatar src={null} alt={expert.displayName} fallback={expert.displayName} size="lg" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          {expert.displayName}
          {expert.isVerified && (
            <span className="text-xs text-primary" title="Verified journalist">
              ✓
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">@{expert.handle}</div>
        {expert.byline && (
          <div className="text-sm text-muted-foreground">{expert.byline}</div>
        )}
        <ExpertisePills tags={topTags} />
        <div className="mt-1 flex flex-wrap gap-2">
          {canMessage && (
            <ProfileSendMessageButton
              peerId={expert.id}
              peerHandle={expert.handle}
              peerDisplayName={expert.displayName}
              peerIsVerified={expert.isVerified}
              peerByline={expert.byline}
            />
          )}
          <Button asChild variant="outline" size="sm">
            <Link href={`/community/u/${expert.handle}`}>View profile</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
