import { Suspense } from "react";

import DiscoverPageContent from "./DiscoverPageContent";
import { SkeletonKit } from "@/components/composites";

export default function Page() {
  return (
    <Suspense fallback={<SkeletonKit.MatchesPage />}>
      <DiscoverPageContent />
    </Suspense>
  );
}
