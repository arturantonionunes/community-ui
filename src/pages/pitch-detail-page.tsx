import Link from 'next/link';
import { PitchDetail } from '../components/pitch-detail';
import { createCommunityClient } from '../client';
import type { CommunitySession } from '../types';

export interface PitchDetailPageProps {
  session: CommunitySession;
  pitchId: string;
  searchParams: Record<string, string | string[] | undefined>;
  apiBase: string;
  cookieHeader?: string;
}

export async function PitchDetailPage({ session, pitchId, searchParams, apiBase, cookieHeader }: PitchDetailPageProps) {
  void searchParams;
  const client = createCommunityClient({ baseUrl: apiBase.replace(/\/api\/community$/, ''), cookieHeader });
  const pitch = await client.pitches.get(pitchId);

  if (!pitch) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <nav className="mb-4 text-sm">
          <Link href="/community/pitches" className="text-muted-foreground hover:text-foreground">
            ← Back to pitches
          </Link>
        </nav>
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <h1 className="text-lg font-semibold">Pitch not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This pitch may have been removed or the link is incorrect.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <nav className="mb-4 text-sm">
        <Link href="/community/pitches" className="text-muted-foreground hover:text-foreground">
          ← Back to pitches
        </Link>
      </nav>
      <PitchDetail pitch={pitch} viewerCommunityUserId={session.communityUserId} />
    </main>
  );
}
