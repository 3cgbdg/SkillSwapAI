import useFriends from "@/hooks/useFriends";
import { IChat, IMatch } from "@/types/types";
import { UseMutateFunction } from "@tanstack/react-query";
import {
  Book,
  Calendar,
  ChevronDown,
  MessageSquare,
  MoreHorizontal,
  UsersRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

function SkillBadges({
  skills,
  variant,
}: {
  skills: { title: string }[];
  variant: "teach" | "learn";
}) {
  const visible = skills.slice(0, 3);
  const overflow = skills.length - visible.length;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((skill) => (
        <Badge key={skill.title} variant={variant}>
          {skill.title}
        </Badge>
      ))}
      {overflow > 0 ? <Badge variant="outline">+{overflow}</Badge> : null}
    </div>
  );
}

const MatchCard = ({
  match,
  isInActiveMatches,
  option,
  getOrCreateChat,
  generateActiveMatch,
}: {
  isInActiveMatches: boolean;
  option: "available" | "active";
  generateActiveMatch: UseMutateFunction<
    { match: IMatch; message: string },
    Error,
    string,
    unknown
  >;
  match: IMatch;
  getOrCreateChat: UseMutateFunction<
    IChat,
    Error,
    { payload: { friendId: string; friendName: string } },
    unknown
  >;
}) => {
  const router = useRouter();
  const { createFriendRequest, isPendingAddFriend } = useFriends();
  const [showAi, setShowAi] = useState(false);
  const canAct = option === "active" || match.isFriend;

  const primaryAction = () => {
    if (!canAct) {
      createFriendRequest({ id: match.other.id });
      return;
    }
    if (option === "active") {
      router.push(`/matches/${match.id}`);
      return;
    }
    if (isInActiveMatches) {
      router.push("/matches/active");
      return;
    }
    generateActiveMatch(match.other.id);
  };

  const primaryLabel = !canAct
    ? "Add friend"
    : option === "active"
      ? "Open plan"
      : isInActiveMatches
        ? "Go to active"
        : "Generate plan";

  return (
    <Card elevation="interactive" className="@container flex h-full flex-col">
      <CardHeader className="relative flex flex-row items-start gap-3 text-left">
        <UserAvatar
          name={match.other.name}
          imageUrl={match.other.imageUrl}
          size="lg"
        />
        <div className="min-w-0 flex-1 pr-12">
          <CardTitle className="truncate text-lg">{match.other.name}</CardTitle>
          {match.aiExplanation ? (
            <button
              type="button"
              className="text-primary mt-1 flex items-center gap-1 text-xs font-semibold"
              onClick={() => setShowAi((v) => !v)}
            >
              Why this match?
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform duration-[var(--duration-fast)]",
                  showAi && "rotate-180"
                )}
              />
            </button>
          ) : null}
        </div>
        {typeof match.compatibility === "number" ? (
          <div
            className="border-primary/30 bg-primary/10 text-primary absolute top-4 right-4 flex size-11 items-center justify-center rounded-full border text-xs font-bold"
            aria-label={`${match.compatibility}% compatibility`}
          >
            {match.compatibility}%
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="flex grow flex-col gap-4">
        {showAi && match.aiExplanation ? (
          <p className="text-muted-foreground animate-fade-in text-sm">
            {match.aiExplanation}
          </p>
        ) : null}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Teaches
          </h3>
          <SkillBadges skills={match.other.knownSkills} variant="teach" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Wants to learn
          </h3>
          <SkillBadges skills={match.other.skillsToLearn} variant="learn" />
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex items-center gap-2 border-t pt-4">
        <Button
          size="sm"
          className="flex-1"
          disabled={!canAct && isPendingAddFriend}
          loading={!canAct && isPendingAddFriend}
          onClick={primaryAction}
        >
          {!canAct ? (
            <UsersRound className="size-4" />
          ) : (
            <Book className="size-4" />
          )}
          {primaryLabel}
        </Button>
        {canAct ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "border-border inline-flex size-7 items-center justify-center rounded-lg border outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              )}
              aria-label="More actions"
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  getOrCreateChat({
                    payload: {
                      friendId: match.other.id,
                      friendName: match.other.name,
                    },
                  })
                }
              >
                <MessageSquare className="size-4" />
                Chat
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    `/calendar?schedule=true&name=${encodeURIComponent(match.other.name)}`
                  )
                }
              >
                <Calendar className="size-4" />
                Schedule
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </CardFooter>
    </Card>
  );
};

export default MatchCard;
