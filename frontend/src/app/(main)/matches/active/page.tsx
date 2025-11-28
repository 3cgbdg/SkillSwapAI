"use client";

import Matches from "@/components/matches/Matches";
import { useAppSelector } from "@/hooks/reduxHooks";

// Finish stuff with isSuccess
const Page = () => {
  const { matches } = useAppSelector((state) => state.matches);
  if (matches && matches.length > 0) {
    return <Matches matches={matches ?? []} option="active" />;
  } else {
    return <h1 className="section-title text-center">No active matches yet</h1>;
  }
};

export default Page;
