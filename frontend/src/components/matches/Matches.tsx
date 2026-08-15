"use client";
import { IMatch } from "@/types/match";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Search, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import MatchCard from "./MatchCard";
import MatchesService from "@/services/MatchesService";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import useMatches from "@/hooks/useMatches";
import ChatsService from "@/services/ChatsService";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataEmpty, SectionPanel } from "@/components/composites";
import { PageBody, PageHeader } from "@/components/layouts";
import { InlineSkillPicker } from "@/components/matches/InlineSkillPicker";

const PENDING_JOB_KEY = "skillswap_pending_match_job";

const Matches = ({
  matches,
  option,
}: {
  matches: IMatch[];
  option: "available" | "active";
}) => {
  const { data: activeMatches = [], refetch: refetchActive } = useMatches();
  const searchParams = useSearchParams();
  const router = useRouter();
  const skillFilter = searchParams.get("skill") ?? "";
  const sortParam = searchParams.get("sort");
  const [pendingPartnerId, setPendingPartnerId] = useState<string | null>(null);
  const basePath = option === "active" ? "/learning" : "/discover";

  useEffect(() => {
    const stored = sessionStorage.getItem(PENDING_JOB_KEY);
    if (stored) {
      try {
        const { partnerId } = JSON.parse(stored) as { partnerId: string };
        setPendingPartnerId(partnerId);
      } catch {
        sessionStorage.removeItem(PENDING_JOB_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (!pendingPartnerId) return;
    const interval = setInterval(() => {
      void refetchActive();
    }, 5000);
    return () => clearInterval(interval);
  }, [pendingPartnerId, refetchActive]);

  useEffect(() => {
    if (!pendingPartnerId) return;
    const found = activeMatches.some((m) => m.other.id === pendingPartnerId);
    if (found) {
      sessionStorage.removeItem(PENDING_JOB_KEY);
      setPendingPartnerId(null);
      showSuccessToast("Your training plan is ready — check Learning.");
    }
  }, [activeMatches, pendingPartnerId]);

  const setSearchParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    router.replace(qs ? `${basePath}?${qs}` : basePath);
  };

  const filteredMatch = useMemo(() => {
    const value = skillFilter.toLowerCase().trim();
    let list = matches;
    if (value) {
      list = matches.filter(
        (match) =>
          match.other.knownSkills.some((item) =>
            item.title.toLowerCase().includes(value)
          ) ||
          match.other.skillsToLearn.some((item) =>
            item.title.toLowerCase().includes(value)
          )
      );
    }
    if (option === "active" && sortParam) {
      list = [...list].sort((a, b) =>
        sortParam === "compat-asc"
          ? a.compatibility - b.compatibility
          : b.compatibility - a.compatibility
      );
    }
    return list;
  }, [matches, skillFilter, sortParam, option]);

  const queryClient = useQueryClient();
  const navRouter = useRouter();
  const { isPending, mutate: generateActiveMatch } = useMutation({
    mutationFn: async (partnerId: string) => {
      const data = await MatchesService.generateActiveMatch(partnerId);
      return { ...data, partnerId };
    },
    onSuccess: (data) => {
      sessionStorage.setItem(
        PENDING_JOB_KEY,
        JSON.stringify({ jobId: data.jobId, partnerId: data.partnerId })
      );
      setPendingPartnerId(data.partnerId);
      showSuccessToast(
        data.message ||
          "Generating your training plan — we'll notify you when it's ready."
      );
    },
    onError: (err: Error) => {
      showErrorToast(err.message);
    },
  });

  const { mutate: createChat } = useMutation({
    mutationFn: async ({
      payload,
    }: {
      payload: { friendId: string; friendName: string };
    }) => ChatsService.createChat(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["chats"], (old: unknown) => {
        if (!old) return [data];
        return [data, ...(old as unknown[])];
      });
      navRouter.push(`/inbox/${data.chatId}`);
    },
    onError: (err: Error) => {
      showErrorToast(err.message);
    },
  });

  return (
    <PageBody>
      {isPending || pendingPartnerId ? (
        <SectionPanel
          className="border-primary/30 bg-primary/5"
          contentClassName="flex items-start gap-3"
        >
          <AlertCircle className="text-primary mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-medium">Generating your AI training plan</p>
            <p className="text-muted-foreground text-body-sm">
              You can keep browsing — we&apos;ll refresh Learning when your
              match is ready.
            </p>
          </div>
        </SectionPanel>
      ) : null}

      <PageHeader
        title={
          option === "active" ? "Your learning matches" : "Discover partners"
        }
        description="Explore potential skill exchange partners based on your teaching and learning goals. Connect to swap knowledge!"
        actions={
          <>
            {option === "active" && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "gap-2 bg-background"
                  )}
                >
                  <Users size={16} />
                  Sort by Compatibility
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-56">
                  <DropdownMenuItem
                    onClick={() => setSearchParam("sort", "compat-asc")}
                  >
                    From lowest to highest
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSearchParam("sort", "compat-desc")}
                  >
                    From highest to lowest
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "min-w-52 gap-2 bg-background"
                )}
              >
                <Search size={16} />
                Filter by Skill
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-60 p-2">
                <Input
                  value={skillFilter}
                  onChange={(e) =>
                    setSearchParam("skill", e.target.value || null)
                  }
                  placeholder="Type in a skill"
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />
      <div className="grid gap-(--space-stack) sm:grid-cols-2 xl:grid-cols-3">
        {filteredMatch.length === 0 ? (
          <div className="col-span-full">
            <DataEmpty
              icon={Users}
              title={
                option === "active"
                  ? "No active matches yet"
                  : "No matches found"
              }
              description={
                option === "active"
                  ? "Generate a plan from Discover to see it here."
                  : "Add a skill you want to learn so we can find better partners."
              }
            >
              {option === "available" ? (
                <InlineSkillPicker mode="learn" />
              ) : null}
            </DataEmpty>
          </div>
        ) : (
          filteredMatch.map((match) => (
            <MatchCard
              option={option}
              isInActiveMatches={
                activeMatches.findIndex(
                  (item) => item?.other?.id === match?.other?.id
                ) !== -1
              }
              generateActiveMatch={generateActiveMatch}
              key={match.id ?? match.other.id}
              match={match}
              getOrCreateChat={createChat}
            />
          ))
        )}
      </div>
    </PageBody>
  );
};

export default Matches;
