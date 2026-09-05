import Link from "next/link";

import { logout } from "@/app/admin/actions";
import { isAdmin } from "@/lib/admin-auth";

const NAV = [
  { href: "/admin/roster", label: "Roster" },
  { href: "/admin/schedule", label: "Schedule" },
  { href: "/admin/schools", label: "Schools" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  // Convenience only — every page and action guards itself with requireAdmin().
  const signedIn = await isAdmin();

  return (
    <>
      {signedIn && (
        <div className="border-b border-white/15">
          <div className="container-page flex items-center gap-5 py-3">
            <span className="text-sm font-semibold text-yellow">Admin</span>
            <nav className="flex gap-5 text-sm text-white/70">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              ))}
            </nav>
            <form action={logout} className="ml-auto">
              <button type="submit" className="text-sm text-white/50 hover:text-white">
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
