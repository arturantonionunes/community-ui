import type { CommunitySession, LinkConflictPayload } from '../types';

export interface LinkConflictPageProps {
  session: CommunitySession | null;
  searchParams: Record<string, string | string[] | undefined>;
  apiBase: string;
  conflict: LinkConflictPayload;
}

export async function LinkConflictPage({ session, searchParams, apiBase, conflict }: LinkConflictPageProps) {
  void session;
  void searchParams;
  void apiBase;

  const PROVIDER_LABEL: Record<string, string> = {
    pressx: 'PressX',
    austrianewsroom: 'Austria Newsroom',
    'the-wire': 'The Wire',
  };

  const existingLabel = PROVIDER_LABEL[conflict.existingProfileSummary.primaryProvider] ?? conflict.existingProfileSummary.primaryProvider;

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-bold">Account already exists</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A community profile already exists for{' '}
          <strong className="text-foreground">{conflict.existingProfileSummary.displayName}</strong>{' '}
          linked to <strong className="text-foreground">{existingLabel}</strong>.
          {conflict.existingProfileSummary.isVerified && (
            <span className="ml-1 text-xs text-primary">✓ Verified journalist</span>
          )}
        </p>

        <p className="mt-4 text-sm text-muted-foreground">
          How would you like to proceed?
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {/* Merge: link the new provider to the existing profile */}
          <form method="POST" action="/api/community/proxy/link/resolve">
            <input type="hidden" name="pendingToken" value={conflict.pendingToken} />
            <input type="hidden" name="action" value="merge" />
            <button
              type="submit"
              className="w-full rounded-lg border border-primary bg-primary px-4 py-3 text-left text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
            >
              <span className="font-semibold">Merge with existing profile</span>
              <p className="mt-0.5 text-xs font-normal opacity-80">
                Sign in as <strong>{conflict.existingProfileSummary.displayName}</strong> and link your new account to it.
              </p>
            </button>
          </form>

          {/* Separate: create a fresh community profile */}
          <form method="POST" action="/api/community/proxy/link/resolve">
            <input type="hidden" name="pendingToken" value={conflict.pendingToken} />
            <input type="hidden" name="action" value="separate" />
            <button
              type="submit"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <span className="font-semibold">Create a separate profile</span>
              <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                Create a new independent community profile for this account.
              </p>
            </button>
          </form>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          If you did not initiate this sign-in, you can safely close this page.
        </p>
      </div>
    </main>
  );
}
