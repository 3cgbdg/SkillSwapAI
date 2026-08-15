import Link from "next/link";
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
import { useState, type CSSProperties } from "react";

import { MetricRing, SwapAxis } from "@/components/composites";
import { Button, buttonVariants } from "@/components/ui/button";
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

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
    { jobId: string; message: string },
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
      if (
        typeof document !== "undefined" &&
        "startViewTransition" in document
      ) {
        (
          document as Document & {
            startViewTransition: (cb: () => void) => void;
          }
        ).startViewTransition(() => {
          router.push(`/matches/${match.id}`);
        });
      } else {
        router.push(`/matches/${match.id}`);
      }
      return;
    }
    if (isInActiveMatches) {
      router.push("/learning");
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
    <Card
      elevation="interactive"
      className="flex h-full flex-col"
      style={
        option === "active"
          ? ({ viewTransitionName: `match-${match.id}` } as CSSProperties)
          : undefined
      }
    >
      <CardHeader className="grid grid-cols-[auto_minmax(8rem,1fr)_auto] items-start gap-4 text-left">
        <HoverCard>
          <HoverCardTrigger>
            <UserAvatar
              name={match.other.name}
              imageUrl={match.other.imageUrl}
              size="lg"
            />
          </HoverCardTrigger>
          <HoverCardContent className="w-56">
            <p className="font-semibold">{match.other.name}</p>
            <p className="text-muted-foreground text-xs">
              {typeof match.compatibility === "number"
                ? `${match.compatibility}% compatibility`
                : "Skill swap partner"}
            </p>
            <Link
              href={`/profiles/${match.other.id}`}
              className="text-primary mt-2 inline-block text-xs font-medium"
            >
              View profile
            </Link>
          </HoverCardContent>
        </HoverCard>
        <div className="min-w-0">
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
          <MetricRing
            value={match.compatibility}
            label={`${match.compatibility}% compatibility`}
          />
        ) : null}
      </CardHeader>
      <CardContent className="flex grow flex-col gap-4">
        {showAi && match.aiExplanation ? (
          <p className="text-muted-foreground animate-fade-in text-sm">
            {match.aiExplanation}
          </p>
        ) : null}
        <SwapAxis
          teach={match.other.knownSkills}
          learn={match.other.skillsToLearn}
        />
      </CardContent>
      <CardFooter className="mt-auto flex items-center gap-4 border-t pt-4">
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
              className={buttonVariants({ variant: "outline", size: "icon" })}
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
                    `/schedule?schedule=true&name=${encodeURIComponent(match.other.name)}`
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
