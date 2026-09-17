import Link from "next/link";

/** The sheet the app slides up for a form: a title, a Cancel link, the form. */
export function FormCard({
  title,
  cancelHref,
  children,
}: {
  title: string;
  cancelHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page py-8 sm:py-10">
      <div className="mx-auto max-w-lg rounded-xl bg-background p-4 text-foreground sm:p-6">
        <div className="flex items-center justify-between">
          <h1 className="headline text-xl">{title}</h1>
          <Link
            href={cancelHref}
            className="text-sm font-medium text-blue underline underline-offset-4 transition hover:opacity-70"
          >
            Cancel
          </Link>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
