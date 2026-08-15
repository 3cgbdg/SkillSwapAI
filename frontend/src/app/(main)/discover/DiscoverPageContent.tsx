"use client";

import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import Link from "next/link";

import Matches from "@/components/matches/Matches";
import { AsyncBoundary, DataEmpty, SkeletonKit } from "@/components/composites";
import useMatches from "@/hooks/useMatches";
import MatchesService from "@/services/MatchesService";
import type { IMatch } from "@/types/match";

function MatchesResult({
  isLoading,
  isError,
  error,
  matches,
  option,
  emptyTitle,
  emptyDescription,
}: {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  matches: IMatch[] | undefined;
  option: "available" | "active";
  emptyTitle: string;
  emptyDescription: ReactNode;
}) {
  return (
    <AsyncBoundary
      isLoading={isLoading}
      isError={isError}
      error={error}
      loadingFallback={<SkeletonKit.MatchesPage />}
    >
      {matches && matches.length > 0 ? (
        <Matches matches={matches} option={option} />
      ) : (
        <DataEmpty
          icon={Users}
          title={emptyTitle}
          description={emptyDescription}
        />
      )}
    </AsyncBoundary>
  );
}

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
    <MatchesResult
      isLoading={isLoading}
      isError={isError}
      error={error}
      matches={availableMatches}
      option="available"
      emptyTitle="No available matches yet"
      emptyDescription="Check back later as more learners join SkillSwap."
    />
  );
}

export function LearningPageContent() {
  const { data: activeMatches = [], isLoading, isError, error } = useMatches();

  return (
    <MatchesResult
      isLoading={isLoading}
      isError={isError}
      error={error}
      matches={activeMatches}
      option="active"
      emptyTitle="No active matches yet"
      emptyDescription={
        <>
          Start a match from{" "}
          <Link href="/discover" className="text-primary underline">
            Discover
          </Link>{" "}
          to begin your training plan.
        </>
      }
    />
  );
}
