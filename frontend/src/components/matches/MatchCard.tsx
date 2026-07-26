import useFriends from "@/hooks/useFriends";
import { IChat, IMatch } from "@/types/types";
import { UseMutateFunction } from "@tanstack/react-query";
import {
  Book,
  Calendar,
  ChevronDown,
  MessageSquare,
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
import { Progress } from "@/components/ui/progress";
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

  return (
    <Card className="@container flex h-full flex-col overflow-hidden">
      <CardHeader className="flex flex-col items-center gap-3 text-center">
        <UserAvatar
          name={match.other.name}
          imageUrl={match.other.imageUrl}
          size="lg"
        />
        <CardTitle>{match.other.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex grow flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Teaches</h3>
          <div className="flex flex-wrap gap-2">
            {match.other.knownSkills.map((skill) => (
              <Badge key={skill.title} variant="teach">
                {skill.title}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Wants to learn</h3>
          <div className="flex flex-wrap gap-2">
            {match.other.skillsToLearn.map((skill) => (
              <Badge key={skill.title} variant="learn">
                {skill.title}
              </Badge>
            ))}
          </div>
        </div>
        {match.aiExplanation ? (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="text-primary flex items-center gap-1 text-sm font-semibold"
              onClick={() => setShowAi((v) => !v)}
            >
              Why this match?
              <ChevronDown
                className={cn(
                  "size-4 transition-transform",
                  showAi && "rotate-180"
                )}
              />
            </button>
            {showAi ? (
              <p className="text-muted-foreground text-sm">
                {match.aiExplanation}
              </p>
            ) : null}
          </div>
        ) : null}
        {match.compatibility ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">
              Compatibility: {match.compatibility}%
            </p>
            <Progress value={match.compatibility} />
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="mt-auto flex flex-wrap justify-center gap-2 border-t pt-4">
        {option === "active" || match.isFriend ? (
          <>
            <Button
              size="sm"
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
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                router.push(
                  `/calendar?schedule=true&name=${encodeURIComponent(match.other.name)}`
                )
              }
            >
              <Calendar className="size-4" />
              Schedule
            </Button>
            {option === "available" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  !isInActiveMatches
                    ? generateActiveMatch(match.other.id)
                    : router.push("/matches/active")
                }
              >
                <Book className="size-4" />
                {isInActiveMatches ? "Go to active matches" : "Generate plan"}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/matches/${match.id}`)}
              >
                <Book className="size-4" />
                Go to your plan
              </Button>
            )}
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-muted-foreground text-sm">To continue:</span>
            <Button
              size="sm"
              variant="outline"
              disabled={isPendingAddFriend}
              loading={isPendingAddFriend}
              onClick={() => createFriendRequest({ id: match.other.id })}
            >
              <UsersRound className="size-4" />
              Add to friends
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default MatchCard;
