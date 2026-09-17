import { PageSkeleton } from "@/components/page-skeleton";

/** About a week of practices and games, so the card lands near its size. */
export default function Loading() {
  return <PageSkeleton rows={6} />;
}
