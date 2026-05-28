import { ChatShell } from '../components/chat-shell';
import { JoinCommunityCard } from '../components/join-community-card';
import { createCommunityClient } from '../client';
import type { CommunitySession } from '../types';

export interface CommunityHomePageProps {
  session: CommunitySession | null;
  searchParams: Record<string, string | string[] | undefined>;
  apiBase: string;
  cookieHeader?: string;
}

export async function CommunityHomePage({ session, searchParams, apiBase, cookieHeader }: CommunityHomePageProps) {
  if (!session) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <JoinCommunityCard />
      </main>
    );
  }

  const client = createCommunityClient({ baseUrl: apiBase.replace(/\/api\/community$/, ''), cookieHeader });
  const rooms = await client.rooms.listVisible();

  if (rooms.length === 0) {
    return (
      <main className="p-8 text-sm text-muted-foreground">
        No rooms have been created yet.
      </main>
    );
  }

  const roomParam = typeof searchParams.room === 'string' ? searchParams.room : undefined;
  const initialSlug = roomParam && rooms.some((r) => r.slug === roomParam) ? roomParam : rooms[0]!.slug;
  const initialMessages = await client.rooms.listMessages(initialSlug, { limit: 50 });

  return (
    <ChatShell
      me={{
        id: session.communityUserId,
        displayName: session.handle,
        avatarUrl: null,
        isVerified: false,
      }}
      rooms={rooms.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        isVerifiedOnly: r.isVerifiedOnly,
      }))}
      initialRoomSlug={initialSlug}
      initialMessages={initialMessages}
    />
  );
}
