"use client";

import Matches from "@/components/matches/Matches";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { WarmScholarEmptyArt } from "@/components/illustrations/WarmScholarEmptyArt";
import useMatches from "@/hooks/useMatches";
import MatchesService from "@/services/MatchesService";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { showErrorToast } from "@/utils/toast";
import { cn } from "@/lib/utils";

export default function MatchesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("tab") === "active" ? "active" : "available";

  const setTab = (value: "available" | "active") => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "available") {
      params.delete("tab");
    } else {
      params.set("tab", "active");
    }
    const qs = params.toString();
    router.replace(qs ? `/matches?${qs}` : "/matches");
  };

  const {
    data: availableMatches,
    isLoading: availableLoading,
    isError: availableError,
    error: availableErr,
  } = useQuery({
    queryKey: ["available", "matches"],
    queryFn: () => MatchesService.getAvailableMatches(),
    enabled: tab === "available",
  });

  const {
    data: activeMatches = [],
    isLoading: activeLoading,
    isError: activeError,
    error: activeErr,
  } = useMatches();

  useEffect(() => {
    if (availableError) {
      showErrorToast(availableErr?.message || "An error occurred");
    }
    if (activeError) {
      showErrorToast(activeErr?.message || "An error occurred");
    }
  }, [availableError, availableErr, activeError, activeErr]);

  const isLoading = tab === "available" ? availableLoading : activeLoading;
  const matches = tab === "available" ? availableMatches : activeMatches;

  return (
    <div className="flex flex-col gap-6">
      <div
        className="bg-muted inline-flex w-fit rounded-lg border border-border p-1"
        role="tablist"
        aria-label="Match type"
      >
        {(["available", "active"] as const).map((value) => (
          <Button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            variant={tab === value ? "default" : "ghost"}
            size="sm"
            className={cn(tab !== value && "text-muted-foreground")}
            onClick={() => setTab(value)}
          >
            {value === "available" ? "Available" : "Active"}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex h-100 items-center justify-center">
          <Spinner size="xl" />
        </div>
      ) : matches && matches.length > 0 ? (
        <Matches matches={matches} option={tab} />
      ) : (
        <EmptyState
          icon={Users}
          title={
            tab === "active"
              ? "No active matches yet"
              : "No available matches yet"
          }
          description={
            tab === "active" ? (
              <>
                Start a match from{" "}
                <Link href="/matches" className="text-primary underline">
                  available partners
                </Link>{" "}
                to begin your training plan.
              </>
            ) : (
              "Check back later as more learners join SkillSwap."
            )
          }
        >
          <WarmScholarEmptyArt className="text-primary h-16 w-24" />
        </EmptyState>
      )}
    </div>
  );
}
