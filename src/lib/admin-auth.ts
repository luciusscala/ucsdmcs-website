import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import "server-only";

const COOKIE = "admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 12;

const password = process.env.ADMIN_PASSWORD;
const secret = process.env.ADMIN_SESSION_SECRET;

function sign(value: string) {
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set.");
  return createHmac("sha256", secret).update(value).digest("hex");
}

/** Constant-time compare so a wrong value can't be probed byte by byte. */
function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function checkPassword(candidate: string) {
  if (!password) throw new Error("ADMIN_PASSWORD is not set.");
  return safeEqual(candidate, password);
}

/** Cookie value is `<expiry>.<hmac>`, so it can't be forged client-side. */
export async function startSession() {
  const expiresAt = String(Date.now() + MAX_AGE_SECONDS * 1000);
  const store = await cookies();

  store.set(COOKIE, `${expiresAt}.${sign(expiresAt)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;

  const [expiresAt, signature] = raw.split(".");
  if (!expiresAt || !signature) return false;
  if (!safeEqual(signature, sign(expiresAt))) return false;

  return Number(expiresAt) > Date.now();
}

/**
 * Guard for every admin page and Server Action. Server Actions are reachable
 * by direct POST, not only through the UI, so each one must call this itself —
 * a check in the layout does not cover them.
 */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
