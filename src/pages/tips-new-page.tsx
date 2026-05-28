import Link from 'next/link';
import { TipForm } from '../components/tip-form';
import { JoinCommunityCard } from '../components/join-community-card';
import type { CommunitySession } from '../types';

export interface TipsNewPageProps {
  session: CommunitySession | null;
  searchParams: Record<string, string | string[] | undefined>;
  apiBase: string;
  cookieHeader?: string;
}

export async function TipsNewPage({ session, searchParams, apiBase, cookieHeader }: TipsNewPageProps) {
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
    <main className="mx-auto max-w-2xl px-4 py-8">
      <nav className="mb-4 text-sm">
        <Link href="/community" className="text-muted-foreground hover:text-foreground">
          ← Back to community
        </Link>
      </nav>
      <h1 className="text-2xl font-bold mb-1">Send a tip</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Share a confidential story lead with our journalists.
      </p>
      <TipForm />
    </main>
  );
}
