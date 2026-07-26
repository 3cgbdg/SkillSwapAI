"use client";

import Matches from "@/components/matches/Matches";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import MatchesService from "@/services/MatchesService";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { showErrorToast } from "@/utils/toast";
import { Users } from "lucide-react";

const Page = () => {
  const {
    data: matches,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["available", "matches"],
    queryFn: async () => {
      const matches = await MatchesService.getAvailableMatches();
      return matches;
    },
  });

  useEffect(() => {
    if (isError) {
      showErrorToast(error?.message || "An error occurred");
    }
  }, [isError, error]);

  if (isLoading) {
    return (
      <div className="flex h-100 items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (matches && matches.length > 0) {
    return <Matches matches={matches} option="available" />;
  }

  return (
    <EmptyState
      icon={Users}
      title="No available matches yet"
      description="Check back later as more learners join SkillSwap."
    />
  );
};

export default Page;
