"use client";

import Matches from "@/components/matches/Matches";
import Spinner from "@/components/Spinner";
import MatchesService from "@/services/MatchesService";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { showErrorToast } from "@/utils/toast";
import useMatches from "@/hooks/useMatches";

const Page = () => {
  //get and maintain available matches
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

  // handling api error
  useEffect(() => {
    if (isError) {
      showErrorToast(error?.message || "An error occurred");
    }
  }, [isError, error]);

  if (!isLoading) {
    if (matches && matches.length > 0) {
      return (
        <>
          <Matches matches={matches ?? []} option="available" />
        </>
      );
    } else {
      return (
        <h1 className="section-title text-center">No available matches yet</h1>
      );
    }
  } else {
    return <Spinner color="blue" size={34} />;
  }
};

export default Page;
