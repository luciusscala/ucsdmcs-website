/**
 * The frame every onboarding step shares: the app's centred title and
 * subtitle above a single control, as a narrow card in the site's style.
 */
export function OnboardingCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-sm rounded-xl bg-background p-6 text-foreground">
        <h1 className="headline text-2xl">{title}</h1>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
