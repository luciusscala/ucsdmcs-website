import { TabBar } from "@/components/team/tab-bar";
import { isComplete, readTeamSession } from "@/lib/team-session";

/**
 * Tabs appear once onboarding is done, as the app's `MainTabView` does.
 * Convenience only — every page and action guards itself with
 * `requireTeamSession()`.
 */
export default async function TeamLayout({ children }: LayoutProps<"/team">) {
  const member = isComplete(await readTeamSession());

  return (
    <>
      {member && <TabBar />}
      {/* Room for the fixed bar on phones, so the last row isn't under it. */}
      <div className={member ? "pb-20 md:pb-0" : ""}>{children}</div>
    </>
  );
}
