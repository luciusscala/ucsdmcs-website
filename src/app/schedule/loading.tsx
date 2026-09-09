import { PageSkeleton } from "@/components/page-skeleton";

/** Roughly a season's worth of fixture rows, so the card lands at its size. */
export default function Loading() {
  return <PageSkeleton rows={6} />;
}
