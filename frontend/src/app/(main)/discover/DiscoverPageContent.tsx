"use client";

import Matches from "@/components/matches/Matches";
import { AsyncBoundary, EmptyState } from "@/components/composites";
import { WarmScholarEmptyArt } from "@/components/illustrations/WarmScholarEmptyArt";
import useMatches from "@/hooks/useMatches";
import MatchesService from "@/services/MatchesService";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import Link from "next/link";

export default function DiscoverPageContent() {
  const {
    data: availableMatches,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["available", "matches"],
    queryFn: () => MatchesService.getAvailableMatches(),
  });

  return (
    <AsyncBoundary isLoading={isLoading} isError={isError} error={error}>
      {availableMatches && availableMatches.length > 0 ? (
        <Matches matches={availableMatches} option="available" />
      ) : (
        <EmptyState
          icon={Users}
          title="No available matches yet"
          description="Check back later as more learners join SkillSwap."
        >
          <WarmScholarEmptyArt className="text-primary h-16 w-24" />
        </EmptyState>
      )}
    </AsyncBoundary>
  );
}

export function LearningPageContent() {
  const { data: activeMatches = [], isLoading, isError, error } = useMatches();

  return (
    <AsyncBoundary isLoading={isLoading} isError={isError} error={error}>
      {activeMatches.length > 0 ? (
        <Matches matches={activeMatches} option="active" />
      ) : (
        <EmptyState
          icon={Users}
          title="No active matches yet"
          description={
            <>
              Start a match from{" "}
              <Link href="/discover" className="text-primary underline">
                Discover
              </Link>{" "}
              to begin your training plan.
            </>
          }
        >
          <WarmScholarEmptyArt className="text-primary h-16 w-24" />
        </EmptyState>
      )}
    </AsyncBoundary>
  );
}
