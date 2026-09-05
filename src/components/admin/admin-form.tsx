"use client";

import { useActionState } from "react";

import type { ActionState } from "@/app/admin/actions";

type Action = (state: ActionState, data: FormData) => Promise<ActionState>;

/**
 * Wraps a Server Action with its pending and error state. React resets an
 * uncontrolled form after a successful action, so entering a list of players
 * or fixtures stays one continuous pass with no page reload.
 */
export function AdminForm({
  action,
  submitLabel,
  children,
  className = "",
}: {
  action: Action;
  submitLabel: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className={className}>
      {children}

      {state?.error && (
        <p role="alert" className="mt-3 text-sm text-orange-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-md bg-navy px-4 py-2 text-sm font-semibold text-yellow transition hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
