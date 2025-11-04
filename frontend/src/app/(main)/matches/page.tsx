"use client"

import Matches from "@/components/matches/Matches";
import Spinner from "@/components/Spinner";
import { useAppSelector } from "@/hooks/reduxHooks"
import MatchesService from "@/services/MatchesService";
import { useQuery } from "@tanstack/react-query";

const Page = () => {


  //get and maintain available matches
  const { data: matches, isLoading } = useQuery({
    queryKey: ['available', 'matches'],
    queryFn: async () => {
      const matches = await MatchesService.getAvailableMatches();
      console.log(matches);
      return matches;
    }
  })

  if (!isLoading) {
    if (matches && matches.length > 0) {
      return (
        <>

          <Matches matches={matches ?? []} option="available" />
        </>
      )
    } else {
      return <h1 className="section-title text-center">No available matches yet</h1>
    }
  } else {
    return <Spinner color="blue" size={34} />
  }
}

export default Page