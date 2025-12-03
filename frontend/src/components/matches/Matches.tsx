"use client";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { updateChats } from "@/redux/chatsSlice";
import ChatsService from "@/services/ChatsService";
import { IMatch } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MatchCard from "./MatchCard";
import MatchesService from "@/services/MatchesService";
import { addMatch } from "@/redux/matchesSlice";
import { toast } from "react-toastify";

const Matches = ({
  matches,
  option,
}: {
  matches: IMatch[];
  option: "available" | "active";
}) => {
  //array for checking if the item is in the active matches so we wont be able to generate new plan again
  const activeMatches = useAppSelector((state) => state.matches.matches);
  const [filteredMatch, setFilteredMatch] = useState<IMatch[]>(matches);
  const [panel, setPanel] = useState<"skill" | "compatibility" | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isPending, mutate: generateActiveMatch } = useMutation({
    mutationFn: async (partnerId: string) => {
      const data = await MatchesService.generateActiveMatch(partnerId);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      dispatch(addMatch(data.match));
      router.push(`/matches/${data.match.id}`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  useEffect(() => {
    if (isPending) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isPending]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (!target.closest(".panel")) {
        setPanel(null);
      }
    };

    if (panel) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [panel]);

  const { mutate: createChat } = useMutation({
    mutationFn: async ({
      payload,
    }: {
      payload: { friendId: string; friendName: string };
    }) => ChatsService.createChat(payload),
    onSuccess: (data) => {
      router.push(`/chats/${data.chat.chatId}`);
      dispatch(updateChats(data.chat));
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  return (
    <>
      {/* loading screen while waiting for ai generating active match */}
      {isPending && (
        <div className="  bg-gray/40  fixed z-200 top-0 left-0 size-full flex items-center justify-center">
          <div className="flex flex-col gap-4">
            <div className="flex gap-1 page-title">
              Loading
              <span className="animate-blink">.</span>
              <span className="animate-blink [animation-delay:0.2s]">.</span>
              <span className="animate-blink [animation-delay:0.4s]">.</span>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-7.5">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-6 flex-wrap justify-between">
            <h1 className="page-title">
              {option == "active" ? "Your" : "Available"} Matches
            </h1>
            <div className="flex gap-3 relative flex-wrap">
              <div className="relative">
                {option == "active" && (
                  <button
                    onClick={() =>
                      setPanel((prev) =>
                        prev == "compatibility" ? null : "compatibility"
                      )
                    }
                    className={`button-transparent bg-white ${panel == "compatibility" ? "rounded-b-none! " : ""} flex h-full items-center gap-2 rounded-md!`}
                  >
                    <Users size={16} />
                    Sort by Compatibility
                  </button>
                )}

                {panel == "compatibility" && option == "active" && (
                  <div className="w-full  panel absolute top-full flex z-10 _border flex-col gap-1 rounded-b-md p-1 bg-white">
                    <button
                      onClick={() =>
                        setFilteredMatch((prev) =>
                          [...prev].sort(
                            (a, b) => a.compatibility - b.compatibility
                          )
                        )
                      }
                      className="button-transparent p-2!"
                    >
                      From lowest to highest
                    </button>
                    <button
                      onClick={() =>
                        setFilteredMatch((prev) =>
                          [...prev].sort(
                            (a, b) => b.compatibility - a.compatibility
                          )
                        )
                      }
                      className="button-transparent p-2!"
                    >
                      From highest to lowest
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() =>
                    setPanel((prev) => (prev == "skill" ? null : "skill"))
                  }
                  className={`button-transparent h-full bg-white min-w-[200px]  flex items-center gap-2 rounded-md! ${panel == "skill" ? "rounded-b-none! " : ""}`}
                >
                  <Search size={16} />
                  Filter by Skill
                </button>
                {panel == "skill" && (
                  <div className="p-1 absolute panel top-full rounded-b-md  _border bg-white">
                    <input
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase().trim();
                        setFilteredMatch(
                          matches.filter(
                            (match) =>
                              match.other.knownSkills.some((item) =>
                                item.title.toLowerCase().includes(value)
                              ) ||
                              match.other.skillsToLearn.some((item) =>
                                item.title.toLowerCase().includes(value)
                              )
                          )
                        );
                      }}
                      placeholder="Type in a skill"
                      className="input rounded-md! w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className="text-gray">
            Explore potential skill exchange partners based on your teaching and
            learning goals. Connect to swap knowledge!
          </p>
        </div>
        <div className="grid max-w-[450px] md:max-w-full mx-auto md:mx-0 md:w-fit  md:grid-cols-2 xl:grid-cols-3 gap-6 ">
          {filteredMatch.map((match, idx) => (
            <MatchCard
              option={option}
              isInActiveMatches={
                activeMatches.findIndex(
                  (item) => item.other.id == match.other.id
                ) == -1
                  ? false
                  : true
              }
              generateActiveMatch={generateActiveMatch}
              key={option == "active" ? match.id : idx}
              match={match}
              getOrCreateChat={createChat}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Matches;
