import useFriends from "@/hooks/useFriends";
import { IChat, IMatch } from "@/types/types";
import { UseMutateFunction } from "@tanstack/react-query";
import {
  Book,
  Calendar,
  MessageSquare,
  UserRound,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { getUserDisplayName } from "@/utils/user";

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
    { chat: IChat },
    Error,
    { payload: { friendId: string; friendName: string } },
    unknown
  >;
}) => {
  const router = useRouter();
  const { createFriendRequest, isPendingAddFriend } = useFriends();
  return (
    <div className="_border rounded-2xl p-6 overflow-hidden flex flex-col">
      <div className="flex flex-col gap-3 mb-3.5 items-center">
        <div className=" _border  relative size-16 flex items-center justify-center rounded-full overflow-hidden">
          {!match?.other.imageUrl ? (
            <UserRound size={24} />
          ) : (
            <Image
              className="object-cover"
              src={match.other.imageUrl}
              fill
              alt="user image"
            />
          )}
        </div>
        <h2 className="leading-7 text-lg font-semibold">{getUserDisplayName(match.other)}</h2>
      </div>
      <div className="flex flex-col gap-4 mb-6 grow ">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm leading-5 font-medium">Teaches:</h3>
          <div className="flex flex-wrap gap-2">
            {match.other.knownSkills.map((skill, idx) => (
              <span
                key={idx}
                className="text-xs leading-5 text-neutral-600 px-1.5 bg-lightBlue border-blue border font-semibold rounded-xl"
              >
                {skill.title}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-sm leading-5 font-medium">Wants to learn:</h3>
          <div className="flex flex-wrap gap-2">
            {match.other.skillsToLearn.map((skill, idx) => (
              <span
                key={idx}
                className="text-xs leading-5 text-neutral-600 px-1.5 border-neutral-600  border font-semibold rounded-xl"
              >
                {skill.title}
              </span>
            ))}
          </div>
        </div>
        {match.aiExplanation && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm leading-5 font-semibold">
              AI Match Explanation:
            </h3>
            <p className="text-sm leading-5 text-gray">{match.aiExplanation}</p>
          </div>
        )}
      </div>
      <div className="">
        {match.compatibility && (
          <div className="text-sm leading-5 font-medium flex flex-col gap-1">
            <h2>Compatibility: {match.compatibility}%</h2>
            <div className="relative w-full rounded-md bg-neutral-300 h-1.5 overflow-hidden">
              <div
                style={{ width: `${match.compatibility}%` }}
                className="absolute top-0 left-0  bg-blue h-full"
              ></div>
            </div>
          </div>
        )}
        <div className=" mx-auto mt-6 place-self-end basis-full">
          {option == "active" || match.isFriend ? (
            <div className="flex gap-3   flex-wrap justify-center">
              <button
                onClick={() =>
                  getOrCreateChat({
                    payload: {
                      friendId: match.other.id,
                      friendName: getUserDisplayName(match.other),
                    },
                  })
                }
                className="button-blue flex gap-2 items-center  font-medium!"
              >
                <MessageSquare size={16} />
                Chat
              </button>
              <button
                onClick={() =>
                  router.push(
                    `/calendar?schedule=true&name=${encodeURIComponent(getUserDisplayName(match.other))}`
                  )
                }
                className="button-transparent rounded-md! flex gap-1 items-center  font-medium!"
              >
                <Calendar size={16} />
                Schedule
              </button>
              {option == "available" ? (
                <button
                  onClick={() =>
                    !isInActiveMatches
                      ? generateActiveMatch(match.other.id)
                      : router.push("/matches/active")
                  }
                  className="button-transparent rounded-md!  flex gap-1 items-center  font-medium!"
                >
                  <Book size={16} />
                  {isInActiveMatches ? "Go to active matches" : "Generate plan"}
                </button>
              ) : (
                <button
                  onClick={() => router.push(`/matches/${match.id}`)}
                  className="button-transparent rounded-md!  flex gap-1 items-center  font-medium!"
                >
                  <Book size={16} />
                  Go to your plan
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span>To continue:</span>
              <button
                disabled={isPendingAddFriend}
                onClick={() => createFriendRequest({ id: match.other.id })}
                className="button-transparent rounded-md! flex gap-1 items-center  font-medium!"
              >
                <UsersRound size={16} />
                Add to friends
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
