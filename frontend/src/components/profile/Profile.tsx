"use client";
import { toast } from "react-toastify";
import AddSkills from "@/components/profile/AddSkills";
import AiService from "@/services/AiService";
import SkillsService from "@/services/SkillsService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GraduationCap, Pencil, UserRound } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useMemo } from "react";
import Spinner from "../Spinner";
import { differenceInHours } from "date-fns";
import ProfilesService from "@/services/ProfilesService";
import useProfile from "@/hooks/useProfile";
import { useState, useEffect, useCallback } from "react";
import { intervalToDuration, formatDuration } from "date-fns";

const Profile = ({
  setIsEditing,
}: {
  setIsEditing: Dispatch<SetStateAction<boolean>>;
}) => {
  const { data: user } = useProfile();
  const queryClient = useQueryClient();
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  const { mutate: addNewSkillToLearn } = useMutation({
    mutationFn: async (title: string) => {
      await SkillsService.addWantToLearnSkill(title, true);
      return title;
    },
    onSuccess: (title: string) => {
      queryClient.setQueryData(["profile"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          skillsToLearn: [...(old.skillsToLearn || []), { id: "temporary-id", title }],
          aiSuggestionSkills: old.aiSuggestionSkills?.filter((s: string) => s !== title),
        };
      });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const { mutate: getNewAiSuggestionSkills, isPending } = useMutation({
    mutationFn: async () => AiService.getNewAiSuggestionSkills(),
    retry: 1,
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(["profile"], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            lastSkillsGenerationDate: new Date().toISOString(),
            aiSuggestionSkills: data.skills,
          };
        });
        toast.success(data.message);
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const cantGenerateSkills = useMemo(() => {
    if (!user?.lastSkillsGenerationDate) return false;
    return (
      differenceInHours(new Date(), new Date(user.lastSkillsGenerationDate)) <= 24
    );
  }, [user?.lastSkillsGenerationDate]);

  const { data: pollingData } = useQuery<string[] | null>({
    queryKey: ["ai-suggestions", user?.id],
    queryFn: async () => {
      const data = await ProfilesService.getPollingDataAiSuggestions();
      if (data && data.length > 0) {
        await queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
      return data || null;
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data || data.length === 0) return 3000;
      return false;
    },
    enabled: !!user && (!user.aiSuggestionSkills || user.aiSuggestionSkills.length === 0) && !cantGenerateSkills,
    refetchOnWindowFocus: false,
  });

  const updateCountdown = useCallback(() => {
    if (!user?.lastSkillsGenerationDate) return;

    const lastDate = new Date(user.lastSkillsGenerationDate);
    const nextAvailableDate = new Date(lastDate.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();

    if (now >= nextAvailableDate) {
      setTimeLeft(null);
      return;
    }

    const duration = intervalToDuration({ start: now, end: nextAvailableDate });

    const h = (duration.hours || 0).toString().padStart(2, "0");
    const m = (duration.minutes || 0).toString().padStart(2, "0");
    const s = (duration.seconds || 0).toString().padStart(2, "0");

    setTimeLeft(`${h}:${m}:${s}`);
  }, [user?.lastSkillsGenerationDate]);

  useEffect(() => {
    if (cantGenerateSkills) {
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
    }
  }, [cantGenerateSkills, updateCountdown]);

  const isGeneratingInitial = !!user && (!user.aiSuggestionSkills || user.aiSuggestionSkills.length === 0) && !cantGenerateSkills;

  const buttonText = useMemo(() => {
    if (isPending || isGeneratingInitial) return "Generating suggestions...";
    if (cantGenerateSkills) return `Wait ${timeLeft || "24h"} for next generation`;
    return "Regenerate";
  }, [isPending, isGeneratingInitial, cantGenerateSkills, timeLeft]);

  return (
    <>
      {user && (
        <div className="flex flex-col gap-8">
          <div className="_border p-8 flex md:flex-row flex-col items-start gap-6 rounded-2xl">
            <div className="w-[96px] h-[96px] flex items-center justify-center _border rounded-full overflow-hidden relative">
              {user.imageUrl ? (
                <Image
                  className=" object-cover"
                  src={user.imageUrl}
                  fill
                  alt="user image"
                />
              ) : (
                <UserRound size={48} />
              )}
            </div>
            <div className="flex flex-col gap-[10px] md:basis-[520px] w-full">
              <h1 className="page-title">{user?.name}</h1>
              {user.bio && <p className="text-gray">{user.bio}</p>}
              <button
                onClick={() => setIsEditing(true)}
                className="button-transparent mt-1 rounded-md! w-fit items-center gap-3"
              >
                <Pencil size={18} />
                Edit Profile
              </button>
            </div>
          </div>
          <AddSkills />
          <div className="_border rounded-2xl px-6 py-5.5">
            <div className="flex items-center justify-between gap-4 border-b mb-4 border-gray py-1">
              <h2 className="text-2xl leading-6 font-bold mb-4">
                AI Skill Suggestions
              </h2>
              <button
                disabled={cantGenerateSkills || isPending || isGeneratingInitial}
                onClick={() => getNewAiSuggestionSkills()}
                className={`button-blue min-w-[260px] ${(cantGenerateSkills || isPending || isGeneratingInitial) ? "bg-gray! cursor-auto!" : ""
                  }`}
              >
                {buttonText}
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {isPending ? (
                <Spinner color="blue" size={32} />
              ) : (user.aiSuggestionSkills && user.aiSuggestionSkills.length > 0) || (pollingData && pollingData.length > 0) ? (
                ((user.aiSuggestionSkills && user.aiSuggestionSkills.length > 0 ? user.aiSuggestionSkills : pollingData) || []).map((skill: string, idx: number) => (
                  <div
                    key={idx}
                    className="not-last:border-b py-3 border-b-neutral-300"
                  >
                    <div className="flex items-start md:items-center flex-col md:flex-row  justify-between gap-4">
                      <div className="flex gap-4 items-center">
                        <div className="size-10 overflow-hidden rounded-full bg-[#3A7AE933] flex items-center justify-center">
                          <GraduationCap className="text-blue " size={20} />
                        </div>
                        <div className="">
                          <h3 className="leading-7 text-lg font-semibold">
                            {skill}
                          </h3>
                        </div>
                      </div>
                      <button
                        onClick={() => addNewSkillToLearn(skill)}
                        className="link hover:underline rounded-2xl!"
                      >
                        Add to Learn
                      </button>
                    </div>
                  </div>
                ))
              ) : isGeneratingInitial ? (
                <Spinner color="blue" size={32} />
              ) : (
                <span className="text-center text-gray italic py-8">
                  {cantGenerateSkills
                    ? "No skills to suggest right now. Come back once the timer runs out! 💤"
                    : "No suggestions found. Try regenerating!"}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
