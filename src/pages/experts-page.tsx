import Link from 'next/link';
import { Users } from 'lucide-react';
import { Button } from '../primitives/button';
import { Input } from '../primitives/input';
import { Label } from '../primitives/label';
import { ExpertCard } from '../components/expert-card';
import { createCommunityClient } from '../client';
import type { CommunitySession } from '../types';

export interface ExpertsPageProps {
  session: CommunitySession;
  searchParams: { tag?: string; q?: string; verified?: string };
  apiBase: string;
  cookieHeader?: string;
}

export async function ExpertsPage({ session, searchParams, apiBase, cookieHeader }: ExpertsPageProps) {
  const client = createCommunityClient({ baseUrl: apiBase.replace(/\/api\/community$/, ''), cookieHeader });
  const tag = searchParams.tag?.trim() || undefined;
  const q = searchParams.q?.trim() || undefined;
  const verifiedOnly = searchParams.verified === '1' || searchParams.verified === 'true';

  const experts = await client.experts.search({ tag, q, verified: verifiedOnly, limit: 30 });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-5">
        <h1 className="text-2xl font-bold">Experts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Discover journalists and contributors by expertise.
        </p>
      </header>

      <form
        method="GET"
        className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border bg-muted/30 p-4"
      >
        <div className="flex flex-col gap-1">
          <Label htmlFor="q-experts">Search</Label>
          <Input
            id="q-experts"
            name="q"
            defaultValue={q ?? ''}
            placeholder="name, handle, or byline"
            className="min-w-[200px]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="tag-experts">Tag</Label>
          <Input
            id="tag-experts"
            name="tag"
            defaultValue={tag ?? ''}
            placeholder="e.g. climate"
            className="min-w-[160px]"
          />
        </div>
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" name="verified" value="1" defaultChecked={verifiedOnly} />
          Verified only
        </label>
        <Button type="submit" size="sm">Apply</Button>
        <Link href="/community/experts" className="self-center text-xs text-muted-foreground hover:text-foreground">
          Reset
        </Link>
      </form>

      {experts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
          <Users className="mx-auto mb-3 size-10 text-muted-foreground/60" />
          <p className="text-sm font-medium text-foreground">No experts match these filters.</p>
          <p className="mt-1 text-xs text-muted-foreground">Try adjusting the filters or clear them.</p>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {experts.map((e) => (
            <ExpertCard key={e.id} expert={e} viewerCommunityUserId={session.communityUserId} />
          ))}
        </div>
      )}
    </main>
  );
}
