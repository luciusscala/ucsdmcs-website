import type { AdminField, AdminTeam } from "@/lib/data/admin";

/**
 * The inputs of the app's practice and game forms, shared by the create and
 * edit pages so the two can't drift. Names match what the actions read.
 */

function FieldSelect({
  fields,
  defaultValue,
}: {
  fields: AdminField[];
  defaultValue?: string | null;
}) {
  return (
    <>
      <label className="field-label" htmlFor="field_id">
        Field
      </label>
      <select
        id="field_id"
        name="field_id"
        required
        defaultValue={defaultValue ?? ""}
        className="field"
      >
        <option value="" disabled>
          Select a field
        </option>
        {fields.map((field) => (
          <option key={field.id} value={field.id}>
            {field.label}
          </option>
        ))}
      </select>
    </>
  );
}

export function PracticeFields({
  fields,
  initial,
}: {
  fields: AdminField[];
  initial?: { date: string; fieldId: string | null; notes: string | null };
}) {
  return (
    <div className="grid gap-4">
      <div>
        <label className="field-label" htmlFor="date">
          Date &amp; time
        </label>
        <input
          id="date"
          name="date"
          type="datetime-local"
          required
          defaultValue={initial?.date}
          className="field"
        />
      </div>
      <div>
        <FieldSelect fields={fields} defaultValue={initial?.fieldId} />
      </div>
      <div>
        <label className="field-label" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={initial?.notes ?? ""}
          placeholder="Optional notes"
          className="field"
        />
      </div>
    </div>
  );
}

export function GameFields({
  fields,
  teams,
  initial,
}: {
  fields: AdminField[];
  teams: AdminTeam[];
  initial?: {
    date: string;
    opponentId: string | null;
    fieldId: string | null;
    isHome: boolean;
  };
}) {
  return (
    <div className="grid gap-4">
      <div>
        <label className="field-label" htmlFor="date">
          Date &amp; time
        </label>
        <input
          id="date"
          name="date"
          type="datetime-local"
          required
          defaultValue={initial?.date}
          className="field"
        />
      </div>
      <div>
        <label className="field-label" htmlFor="opponent_id">
          Opponent
        </label>
        <select
          id="opponent_id"
          name="opponent_id"
          required
          defaultValue={initial?.opponentId ?? ""}
          className="field"
        >
          <option value="" disabled>
            Select opponent
          </option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          name="is_home"
          type="checkbox"
          defaultChecked={initial?.isHome ?? true}
          className="size-4"
        />
        Home game
      </label>
      <div>
        <FieldSelect fields={fields} defaultValue={initial?.fieldId} />
      </div>
    </div>
  );
}
