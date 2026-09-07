"use client";

import { useActionState } from "react";

import type { ActionState } from "@/app/admin/actions";

type Action = (state: ActionState, data: FormData) => Promise<ActionState>;

const BUTTON =
  "rounded-md px-4 py-2 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50";

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
  confirm,
  destructive = false,
}: {
  action: Action;
  submitLabel: string;
  children: React.ReactNode;
  className?: string;
  /** When set, the browser asks this before the action runs. */
  confirm?: string;
  /** Red button and a "Deleting…" pending label, for irreversible actions. */
  destructive?: boolean;
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
        // Cancelling the click stops the submit, so the action never fires.
        onClick={(event) => {
          if (confirm && !window.confirm(confirm)) event.preventDefault();
        }}
        className={
          destructive
            ? `${BUTTON} border border-red-300 bg-white text-red-700 hover:bg-red-50`
            : `mt-4 ${BUTTON} bg-navy text-yellow`
        }
      >
        {pending ? (destructive ? "Deleting…" : "Saving…") : submitLabel}
      </button>
    </form>
  );
}
