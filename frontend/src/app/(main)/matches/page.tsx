"use client";

import Matches from "@/components/matches/Matches";
import Spinner from "@/components/Spinner";
import MatchesService from "@/services/MatchesService";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "react-toastify";

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
      toast.error(error.message);
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
