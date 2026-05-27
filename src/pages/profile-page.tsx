import { ProfileCard } from '../components/profile-card';
import { ProfileActivityFeed } from '../components/profile-activity-feed';
import { ExpertisePills } from '../components/expertise-pills';
import { createCommunityClient } from '../client';
import { listHandleExpertise } from '../client/profiles';
import type { CommunitySession } from '../types';

export interface ProfilePageProps {
  handle: string;
  searchParams: Record<string, string | string[] | undefined>;
  apiBase: string;
  session: CommunitySession | null;
}

export async function ProfilePage({ handle, searchParams, apiBase, session }: ProfilePageProps) {
  void searchParams;
  const client = createCommunityClient({ baseUrl: apiBase.replace(/\/api\/community$/, '') });
  const profile = await client.profiles.getByHandle(handle);

  if (!profile) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-lg font-semibold">Profile not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This user does not exist or their profile has been removed.
        </p>
      </main>
    );
  }

  const viewerIsSignedIn = !!session;

  if (profile.isProfilePrivate && !viewerIsSignedIn) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-lg font-semibold">This profile is private</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to the community to view this profile.
        </p>
        <a
          href="/community"
          className="mt-4 inline-block rounded-md bg-foreground px-3.5 py-1.5 text-sm font-medium text-background hover:opacity-90"
        >
          Sign in
        </a>
      </main>
    );
  }

  const expertiseTags = await listHandleExpertise(
    { base: apiBase.replace(/\/api\/community$/, ''), fetch: globalThis.fetch },
    handle,
  ).catch(() => []);

  const activityItems = profile.showActivity && profile.recentActivity ? profile.recentActivity : [];

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <ProfileCard
        profile={{
          id: profile.id,
          handle: profile.handle,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          byline: profile.byline,
          bio: profile.bio,
          isVerifiedJournalist: profile.isVerifiedJournalist,
          verifiedCardTier: profile.verifiedCardTier,
          primaryProvider: profile.primaryProvider,
          joinedAt: profile.joinedAt,
          canEdit: profile.canEdit,
        }}
        identityLinks={profile.identityLinks}
        viewerIsSignedIn={viewerIsSignedIn}
      />
      {expertiseTags.length > 0 && (
        <section className="mt-4">
          <ExpertisePills tags={expertiseTags} />
        </section>
      )}
      {profile.showActivity && (
        <ProfileActivityFeed
          handle={profile.handle}
          initialMessages={activityItems}
        />
      )}
    </main>
  );
}
