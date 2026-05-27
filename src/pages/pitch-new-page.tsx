import Link from 'next/link';
import { PitchForm } from '../components/pitch-form';
import { JoinCommunityCard } from '../components/join-community-card';
import type { CommunitySession } from '../types';

export interface PitchNewPageProps {
  session: CommunitySession | null;
  searchParams: Record<string, string | string[] | undefined>;
  apiBase: string;
}

export async function PitchNewPage({ session, searchParams, apiBase }: PitchNewPageProps) {
  void searchParams;
  void apiBase;

  if (!session) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <JoinCommunityCard />
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
      <h1 className="text-2xl font-bold mb-6">New pitch</h1>
      <PitchForm />
    </main>
  );
}
