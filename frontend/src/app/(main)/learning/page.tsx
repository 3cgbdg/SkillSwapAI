import { Suspense } from "react";

import { LearningPageContent } from "../discover/DiscoverPageContent";
import { SkeletonKit } from "@/components/composites";

export default function Page() {
  return (
    <Suspense fallback={<SkeletonKit.MatchesPage />}>
      <LearningPageContent />
    </Suspense>
  );
}
