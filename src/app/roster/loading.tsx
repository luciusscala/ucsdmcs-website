import { PageSkeleton } from "@/components/page-skeleton";

/** The squad runs to around 25, so the skeleton is taller than the schedule's. */
export default function Loading() {
  return <PageSkeleton rows={10} />;
}
