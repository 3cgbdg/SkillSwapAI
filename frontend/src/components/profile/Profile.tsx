"use client";
import { toast } from "react-toastify";
import AddSkills from "@/components/profile/AddSkills";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import {
  addAiSuggestionSkills,
  addWantToLearnSkill,
  generatedAiSuggestions,
  removeAiSuggestionSkill,
} from "@/redux/authSlice";
import AiService from "@/services/AiService";
import SkillsService from "@/services/SkillsService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GraduationCap, Pencil, UserRound } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useMemo } from "react";
import Spinner from "../Spinner";
import { differenceInHours } from "date-fns";
import ProfilesService from "@/services/ProfilesService";

const Profile = ({
  setIsEditing,
}: {
  setIsEditing: Dispatch<SetStateAction<boolean>>;
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { mutate: addNewSkillToLearn } = useMutation({
    mutationFn: async (title: string) => {
      await SkillsService.addWantToLearnSkill(title, true);
      return title;
    },
    onSuccess: (title: string) => {
      dispatch(addWantToLearnSkill(title));
      dispatch(removeAiSuggestionSkill(title));
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
        dispatch(generatedAiSuggestions());
        dispatch(addAiSuggestionSkills(data.skills));
        toast.success(data.message);
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const { data: pollingData } = useQuery({
    queryKey: ["ai-suggestions", user?.id],
    queryFn: async () => {
      const res = await ProfilesService.getPollingDataAiSuggestions();
      if (res.data && res.data.length > 0) {
        dispatch(addAiSuggestionSkills(res.data));
        dispatch(generatedAiSuggestions());
      }
      return res.data;
    },
    refetchInterval: (query) => {
      // Data is the 'data' from the latest query result
      if (!query.state.data || query.state.data.length === 0) return 5000;
      return false;
    },
    enabled: !!user && (!user.aiSuggestionSkills || user.aiSuggestionSkills.length === 0),
    refetchOnWindowFocus: false,
  });

  const isGeneratingInitial = !!user && (!user.aiSuggestionSkills || user.aiSuggestionSkills.length === 0);

  const cantGenerateSkills = useMemo(() => {
    if (!user?.lastSkillsGenerationDate) return false;
    return (
      differenceInHours(new Date(), new Date(user.lastSkillsGenerationDate)) <= 24
    );
  }, [user?.lastSkillsGenerationDate]);

  const buttonText = useMemo(() => {
    if (isPending || isGeneratingInitial) return "Generating suggestions...";
    if (cantGenerateSkills) return "Wait 24h for next generation";
    return "Regenerate";
  }, [isPending, isGeneratingInitial, cantGenerateSkills]);

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
              <h1 className="text-3xl leading-9.5 font-bold ">{user?.name}</h1>
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
            <div className="flex items-center justify-between gap-4 border-b-1 mb-4 border-gray py-1">
              <h2 className="text-2xl leading-6 font-bold mb-4">
                AI Skill Suggestions
              </h2>
              <button
                disabled={cantGenerateSkills || isPending || isGeneratingInitial}
                onClick={() => getNewAiSuggestionSkills()}
                className={`button-blue ${(cantGenerateSkills || isPending || isGeneratingInitial) ? "bg-gray! cursor-auto!" : ""
                  }`}
              >
                {buttonText}
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {isPending ? (
                <Spinner color="blue" size={32} />
              ) : (user.aiSuggestionSkills && user.aiSuggestionSkills.length > 0) || (pollingData && pollingData.length > 0) ? (
                (user.aiSuggestionSkills && user.aiSuggestionSkills.length > 0 ? user.aiSuggestionSkills : pollingData!).map((skill, idx) => (
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
              ) : !user.aiSuggestionSkills || user.aiSuggestionSkills.length === 0 ? (
                <Spinner color="blue" size={32} />
              ) : (
                <span className="text-center">
                  {cantGenerateSkills ? "💤💤💤" : "Regenerate"}
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
