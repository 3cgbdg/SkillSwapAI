"use client";

import useMatches from "@/hooks/useMatches";
import { Spinner } from "@/components/ui/spinner";
import Matches from "@/components/matches/Matches";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";

const Page = () => {
  const { data: matches = [], isLoading } = useMatches();

  if (isLoading) {
    return (
      <div className="flex h-100 items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (matches.length > 0) {
    return <Matches matches={matches} option="active" />;
  }

  return (
    <EmptyState
      icon={Users}
      title="No active matches yet"
      description="Start a match from available partners to begin your training plan."
    />
  );
};

export default Page;
