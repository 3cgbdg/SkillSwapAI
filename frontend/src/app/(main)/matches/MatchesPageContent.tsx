"use client";

import Matches from "@/components/matches/Matches";
import { EmptyState, SegmentedControl } from "@/components/composites";
import { Spinner } from "@/components/ui/spinner";
import { WarmScholarEmptyArt } from "@/components/illustrations/WarmScholarEmptyArt";
import useMatches from "@/hooks/useMatches";
import MatchesService from "@/services/MatchesService";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AsyncBoundary } from "@/components/composites";

export default function MatchesPageContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const tabFromPath = pathname.startsWith("/learning") ? "active" : "available";
  const tab = searchParams.get("tab") === "active" ? "active" : tabFromPath;

  const setTab = (value: "available" | "active") => {
    if (value === "active") {
      router.replace("/learning");
      return;
    }
    router.replace("/discover");
  };

  const {
    data: availableMatches,
    isLoading: availableLoading,
    isError: availableError,
    error: availableErr,
  } = useQuery({
    queryKey: ["available", "matches"],
    queryFn: () => MatchesService.getAvailableMatches(),
    enabled: tab === "available",
  });

  const {
    data: activeMatches = [],
    isLoading: activeLoading,
    isError: activeError,
    error: activeErr,
  } = useMatches();

  const isLoading = tab === "available" ? availableLoading : activeLoading;
  const matches = tab === "available" ? availableMatches : activeMatches;
  const queryError = availableError || activeError;
  const queryErr = availableErr || activeErr;

  return (
    <AsyncBoundary isError={queryError} error={queryErr} loadingFallback={null}>
      <div className="flex flex-col gap-6">
        <SegmentedControl
          aria-label="Match type"
          value={tab}
          onValueChange={setTab}
          options={[
            { value: "available", label: "Available" },
            { value: "active", label: "Active" },
          ]}
        />

        {isLoading ? (
          <div className="flex h-100 items-center justify-center">
            <Spinner size="xl" />
          </div>
        ) : matches && matches.length > 0 ? (
          <Matches matches={matches} option={tab} />
        ) : (
          <EmptyState
            icon={Users}
            title={
              tab === "active"
                ? "No active matches yet"
                : "No available matches yet"
            }
            description={
              tab === "active" ? (
                <>
                  Start a match from{" "}
                  <Link href="/discover" className="text-primary underline">
                    available partners
                  </Link>{" "}
                  to begin your training plan.
                </>
              ) : (
                "Check back later as more learners join SkillSwap."
              )
            }
          >
            <WarmScholarEmptyArt className="text-primary h-16 w-24" />
          </EmptyState>
        )}
      </div>
    </AsyncBoundary>
  );
}
