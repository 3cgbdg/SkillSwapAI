import { Suspense } from "react";

import MatchesPageContent from "./MatchesPageContent";
import { Spinner } from "@/components/ui/spinner";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-100 items-center justify-center">
          <Spinner size="xl" />
        </div>
      }
    >
      <MatchesPageContent />
    </Suspense>
  );
}
