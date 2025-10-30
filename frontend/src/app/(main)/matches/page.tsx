"use client"

import GeneratedMatches from "@/components/matches/GeneratedMatches"
import GeneratingMatchesPage from "@/components/matches/GeneratingMatchesPage"
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks"
import { getMatches } from "@/redux/matchesSlice"
import MatchesService from "@/services/MatchesService"
import { useMutation } from "@tanstack/react-query"


// Finish stuff with isSuccess
const Page = () => {
  const {matches} = useAppSelector(state=>state.matches);
  const dispatch = useAppDispatch();
  const { mutate: generateMatches, data: matchesCreated, isError, isPending, isSuccess } = useMutation({
    mutationFn: async () => MatchesService.generateMatches(),
    onSuccess:(data)=>{
      dispatch(getMatches(data))
    }
  })

  if ( (matches && matches.length>0)|| matchesCreated ) {
    return (
      <GeneratedMatches matches={matches ?? matchesCreated    ?? []} />
    )
  } else {
    return (
      <GeneratingMatchesPage isPending={isPending} isError={isError} generateMatches={generateMatches} />
    )
  }

}

export default Page