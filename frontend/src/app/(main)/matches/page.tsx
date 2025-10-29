"use client"

import { api } from "@/services/axiosInstance"
import GeneratedMatches from "@/components/matches/GeneratedMatches"
import GeneratingMatchesPage from "@/components/matches/GeneratingMatchesPage"
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks"
import { getMatches } from "@/redux/matchesSlice"
import { IMatch } from "@/types/types"
import { useMutation } from "@tanstack/react-query"
import { useEffect } from "react"


// Finish stuff with isSuccess
const Page = () => {
  const {matches} = useAppSelector(state=>state.matches);
  const dispatch = useAppDispatch();
  const { mutate: generateMatches, data: matchesCreated, isError, isPending, isSuccess } = useMutation({
    mutationFn: async () => {
      const res = await api.post('matches');
      return res.data as IMatch[];
    },
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