"use client";
import { IMatch } from "@/types/match";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import MatchCard from "./MatchCard";
import MatchesService from "@/services/MatchesService";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import useMatches from "@/hooks/useMatches";
import ChatsService from "@/services/ChatsService";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { InlineSkillPicker } from "@/components/matches/InlineSkillPicker";

const Matches = ({
  matches,
  option,
}: {
  matches: IMatch[];
  option: "available" | "active";
}) => {
  const { data: activeMatches = [] } = useMatches();
  const searchParams = useSearchParams();
  const router = useRouter();
  const skillFilter = searchParams.get("skill") ?? "";
  const sortParam = searchParams.get("sort");

  const setSearchParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    router.replace(qs ? `/matches?${qs}` : "/matches");
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
      return data;
    },
    onSuccess: (data) => {
      showSuccessToast(data.message || "Your training plan is ready!");
      queryClient.setQueryData(["matches"], (old: any) => {
        if (!old) return [data.match];
        return [...old, data.match];
      });
      navRouter.push(`/matches/${data.match.id}`);
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
      queryClient.setQueryData(["chats"], (old: any) => {
        if (!old) return [data];
        return [data, ...old];
      });
      navRouter.push(`/chats/${data.chatId}`);
    },
    onError: (err: Error) => {
      showErrorToast(err.message);
    },
  });

  return (
    <>
      <Dialog open={isPending}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogTitle className="text-center text-2xl font-bold">
            Loading
            <span className="animate-blink">.</span>
            <span className="animate-blink [animation-delay:0.2s]">.</span>
            <span className="animate-blink [animation-delay:0.4s]">.</span>
          </DialogTitle>
          <DialogDescription className="text-center">
            Generating your AI-powered training plan…
          </DialogDescription>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-7.5">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-6 flex-wrap justify-between">
            <h1 className="font-heading text-h1 text-foreground">
              {option == "active" ? "Your" : "Available"} Matches
            </h1>
            <div className="flex gap-3 flex-wrap">
              {option == "active" && (
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
                  <DropdownMenuContent align="end" className="min-w-[220px]">
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
                    "min-w-[200px] gap-2 bg-background"
                  )}
                >
                  <Search size={16} />
                  Filter by Skill
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[240px] p-2">
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
            </div>
          </div>
          <p className="text-muted-foreground">
            Explore potential skill exchange partners based on your teaching and
            learning goals. Connect to swap knowledge!
          </p>
        </div>
        <div className="grid max-w-[450px] md:max-w-full mx-auto md:mx-0 md:w-fit md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMatch.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon={Users}
                title={
                  option === "active"
                    ? "No active matches yet"
                    : "No matches found"
                }
                description={
                  option === "active"
                    ? "Generate a plan from an available match to see it here."
                    : "Add a skill you want to learn so we can find better partners."
                }
              >
                {option === "available" ? (
                  <InlineSkillPicker mode="learn" />
                ) : null}
              </EmptyState>
            </div>
          ) : (
            filteredMatch.map((match) => (
              <MatchCard
                option={option}
                isInActiveMatches={
                  activeMatches.findIndex(
                    (item) => item?.other?.id === match?.other?.id
                  ) === -1
                    ? false
                    : true
                }
                generateActiveMatch={generateActiveMatch}
                key={match.id ?? match.other.id}
                match={match}
                getOrCreateChat={createChat}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Matches;
