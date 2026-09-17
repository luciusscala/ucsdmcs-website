"use client";

import { useState } from "react";

import { createRepeatingPractices } from "@/app/team/actions";
import { AdminForm } from "@/components/admin/admin-form";
import type { AdminField } from "@/lib/data/admin";

/** Sunday first, numbered as `Date#getUTCDay` — what the action reads back. */
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "2026-09-16" for today, for the date inputs' defaults. */
const today = () => new Date().toISOString().slice(0, 10);

const plusOneMonth = () => {
  const date = new Date();
  date.setUTCMonth(date.getUTCMonth() + 1);
  return date.toISOString().slice(0, 10);
};

const parse = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
};

/**
 * The app's repeating form, with its live "This will create N practices"
 * line. Only the day toggles and date range are held in state — that's all
 * the count depends on; the rest are ordinary uncontrolled inputs.
 */
export function RepeatingPracticeForm({ fields }: { fields: AdminField[] }) {
  const [days, setDays] = useState<Set<number>>(new Set());
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(plusOneMonth);

  const toggle = (day: number) =>
    setDays((current) => {
      const next = new Set(current);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });

  // Same walk the action does, so the number shown is the number created.
  let count = 0;
  if (days.size > 0 && start && end && start <= end) {
    for (let at = parse(start); at <= parse(end); at += 86_400_000) {
      if (days.has(new Date(at).getUTCDay())) count += 1;
    }
  }

  return (
    <AdminForm action={createRepeatingPractices} submitLabel="Create">
      <div className="grid gap-5">
        <fieldset>
          <legend className="field-label">Days of week</legend>
          <div className="grid grid-cols-7 gap-1.5">
            {DAYS.map((label, day) => {
              const on = days.has(day);
              return (
                <label
                  key={label}
                  className={`cursor-pointer rounded-md border py-2 text-center text-xs font-semibold transition ${
                    on
                      ? "border-2 border-navy bg-navy/10 text-navy"
                      : "border-border-strong text-muted hover:bg-surface"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="day"
                    value={day}
                    checked={on}
                    onChange={() => toggle(day)}
                    className="sr-only"
                  />
                  {label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="start_date">
              Start
            </label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              required
              value={start}
              onChange={(event) => setStart(event.target.value)}
              className="field"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="end_date">
              End
            </label>
            <input
              id="end_date"
              name="end_date"
              type="date"
              required
              min={start}
              value={end}
              onChange={(event) => setEnd(event.target.value)}
              className="field"
            />
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="time">
            Practice time
          </label>
          <input
            id="time"
            name="time"
            type="time"
            required
            defaultValue="18:00"
            className="field"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="field_id">
            Field
          </label>
          <select id="field_id" name="field_id" required defaultValue="" className="field">
            <option value="" disabled>
              Select a field
            </option>
            {fields.map((field) => (
              <option key={field.id} value={field.id}>
                {field.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Optional notes"
            className="field"
          />
        </div>

        {count > 0 && (
          <p className="text-sm text-muted">
            This will create <strong className="text-foreground">{count}</strong>{" "}
            {count === 1 ? "practice" : "practices"}
          </p>
        )}
      </div>
    </AdminForm>
  );
}
