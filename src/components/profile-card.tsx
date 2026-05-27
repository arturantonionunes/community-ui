'use client';
import Link from 'next/link';
import { ProfileSendMessageButton } from './profile-send-message-button';

interface ProfileCardProps {
  profile: {
    id: string;
    handle: string;
    displayName: string;
    avatarUrl: string | null;
    byline: string | null;
    bio: string;
    isVerifiedJournalist: boolean;
    verifiedCardTier: 'basic' | 'editorial' | null;
    primaryProvider: 'pressx' | 'austrianewsroom' | 'the-wire';
    joinedAt: string;
    canEdit: boolean;
  };
  identityLinks: Array<{ provider: 'pressx' | 'austrianewsroom' | 'the-wire'; linkedAt: string }>;
  viewerIsSignedIn: boolean;
}

const PROVIDER_LABEL: Record<string, string> = {
  pressx: 'pressx ⓟ',
  austrianewsroom: 'austria newsroom ⓐ',
  'the-wire': 'the wire ⓦ',
};

export function ProfileCard({ profile, identityLinks, viewerIsSignedIn }: ProfileCardProps) {
  const joinedDate = new Date(profile.joinedAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  return (
    <section className="border-b p-6">
      <div className="flex items-start gap-5">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt=""
            width={80}
            height={80}
            className="size-20 rounded-xl object-cover"
          />
        ) : (
          <div className="size-20 rounded-xl bg-muted" />
        )}
        <div className="flex-1">
          <h1 className="m-0 flex items-center gap-1.5 text-2xl font-bold">
            {profile.displayName}
            {profile.isVerifiedJournalist && (
              <span
                title={`Verified · ${profile.verifiedCardTier ?? 'basic'} press card`}
                className="text-base text-amber-700"
              >
                ⓥ
              </span>
            )}
          </h1>
          <div className="mt-0.5 text-sm text-muted-foreground">
            @{profile.handle}
            {profile.byline && <span className="ml-2">· {profile.byline}</span>}
          </div>
          {profile.bio && <p className="mt-3 whitespace-pre-wrap text-sm">{profile.bio}</p>}
          <div className="mt-3 flex flex-wrap gap-2.5 text-xs text-muted-foreground">
            {identityLinks.length > 0 && (
              <span>
                Linked:{' '}
                {identityLinks.map((l, i) => (
                  <span key={l.provider}>
                    {i > 0 && ' · '}
                    {PROVIDER_LABEL[l.provider] ?? l.provider}
                  </span>
                ))}
              </span>
            )}
            <span>· Member since {joinedDate}</span>
          </div>
          <div className="mt-4 flex gap-2">
            {viewerIsSignedIn && !profile.canEdit && (
              <ProfileSendMessageButton
                peerId={profile.id}
                peerHandle={profile.handle}
                peerDisplayName={profile.displayName}
                peerIsVerified={profile.isVerifiedJournalist}
              />
            )}
            {profile.canEdit && (
              <Link
                href={`/community/u/${encodeURIComponent(profile.handle)}/edit`}
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground no-underline transition-colors hover:bg-primary/90"
              >
                Edit profile
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
