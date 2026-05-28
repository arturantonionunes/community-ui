import Link from 'next/link';
import { Inbox } from 'lucide-react';
import { Button } from '../primitives/button';
import { Input } from '../primitives/input';
import { Label } from '../primitives/label';
import { PitchCard } from '../components/pitch-card';
import { createCommunityClient } from '../client';
import type { CommunitySession, PitchStatus } from '../types';

export interface PitchesPageProps {
  session: CommunitySession;
  searchParams: { status?: string; tag?: string; q?: string; owner?: string; before?: string };
  apiBase: string;
}

const VALID_STATUSES: PitchStatus[] = ['open', 'claimed', 'in_progress', 'published', 'archived'];
function asStatus(v: string | undefined): PitchStatus | undefined {
  return v && (VALID_STATUSES as string[]).includes(v) ? (v as PitchStatus) : undefined;
}

export async function PitchesPage({ session, searchParams, apiBase }: PitchesPageProps) {
  const client = createCommunityClient({ baseUrl: apiBase.replace(/\/api\/community$/, '') });
  const pitches = await client.pitches.list({
    status: asStatus(searchParams.status),
    tag: searchParams.tag,
    q: searchParams.q,
    owner: searchParams.owner,
    before: searchParams.before,
    limit: 30,
  });
  void session;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
      <aside className="rounded-xl border bg-muted/30 p-4 md:sticky md:top-4 h-fit">
        <h2 className="mb-3 text-sm font-semibold">Filters</h2>
        <form method="GET" className="flex flex-col gap-3">
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={searchParams.status ?? ''}
              className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="claimed">Claimed</option>
              <option value="in_progress">In progress</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <Label htmlFor="tag">Tag</Label>
            <Input id="tag" name="tag" defaultValue={searchParams.tag ?? ''} placeholder="e.g. climate" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="q">Search</Label>
            <Input id="q" name="q" defaultValue={searchParams.q ?? ''} placeholder="title or summary" className="mt-1" />
          </div>
          <Button type="submit" size="sm">Apply</Button>
          <Link href="/community/pitches" className="text-center text-xs text-muted-foreground hover:text-foreground">
            Reset
          </Link>
        </form>
      </aside>
      <section>
        <header className="mb-5 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Pitches</h1>
          <Button asChild size="sm"><Link href="/community/pitches/new">New pitch</Link></Button>
        </header>
        {pitches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
            <Inbox className="mx-auto mb-3 size-10 text-muted-foreground/60" />
            <p className="text-sm font-medium text-foreground">No pitches match these filters.</p>
            <p className="mt-1 text-xs text-muted-foreground">Try adjusting the filters or clear them.</p>
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {pitches.map((p) => <PitchCard key={p.id} pitch={p} />)}
          </div>
        )}
      </section>
    </main>
  );
}
