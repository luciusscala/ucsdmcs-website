/** Shown when the admin write client has no credentials, instead of a bare 500. */
export function SetupNotice() {
  return (
    <div className="container-page py-12">
      <div className="max-w-xl rounded-lg bg-background p-5 text-foreground">
        <h1 className="headline text-xl">Admin isn&rsquo;t configured</h1>
        <p className="mt-2 text-sm text-muted">
          Set <code>SUPABASE_SECRET_KEY</code> in <code>.env.local</code> and
          restart the server. The key is under Project Settings &rarr; API Keys
          and must stay server-side: it bypasses row-level security.
        </p>
      </div>
    </div>
  );
}
