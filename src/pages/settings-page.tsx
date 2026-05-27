import { ProfileEditForm } from '../components/profile-edit-form';
import { createCommunityClient } from '../client';
import type { CommunitySession } from '../types';

export interface SettingsPageProps {
  session: CommunitySession;
  searchParams: Record<string, string | string[] | undefined>;
  apiBase: string;
}

export async function SettingsPage({ session, searchParams, apiBase }: SettingsPageProps) {
  void searchParams;
  const client = createCommunityClient({ baseUrl: apiBase.replace(/\/api\/community$/, '') });
  const profile = await client.profiles.getByHandle(session.handle);

  if (!profile) {
    return (
      <main className="mx-auto max-w-xl px-4 py-8">
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          Profile not found. Please refresh or contact support.
        </div>
      </main>
    );
  }

  return (
    <ProfileEditForm
      initial={{
        handle: profile.handle,
        displayName: profile.displayName,
        byline: profile.byline,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        isProfilePrivate: profile.isProfilePrivate,
        showActivity: profile.showActivity,
      }}
    />
  );
}
