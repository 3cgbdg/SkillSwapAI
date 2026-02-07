"use client";

import useMatches from "@/hooks/useMatches";
import Spinner from "@/components/Spinner";
import Matches from "@/components/matches/Matches";

const Page = () => {
  const { data: matches = [], isLoading } = useMatches();

  if (isLoading) {
    return (
      <div className="h-100 flex items-center justify-center">
        <Spinner color="blue" size={44} />
      </div>
    );
  }

  if (matches.length > 0) {
    return <Matches matches={matches} option="active" />;
  } else {
    return <h1 className="section-title text-center">No active matches yet</h1>;
  }
};

export default Page;
