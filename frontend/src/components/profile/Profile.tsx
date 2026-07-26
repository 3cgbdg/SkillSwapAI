"use client";

import AddSkills from "@/components/profile/AddSkills";
import AiService from "@/services/AiService";
import SkillsService from "@/services/SkillsService";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import useProfile from "@/hooks/useProfile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { differenceInHours, intervalToDuration } from "date-fns";
import { GraduationCap, Pencil } from "lucide-react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { UserAvatar } from "@/components/ui/user-avatar";

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
          skillsToLearn: [
            ...(old.skillsToLearn || []),
            { id: "temporary-id", title },
          ],
          aiSuggestionSkills: old.aiSuggestionSkills?.filter(
            (s: string) => s !== title
          ),
        };
      });
    },
    onError: (err: Error) => {
      showErrorToast(err.message);
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
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
        showSuccessToast(data.message);
        void queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
    },
    onError: (err: Error) => {
      showErrorToast(err.message);
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const cantGenerateSkills = useMemo(() => {
    if (!user?.lastSkillsGenerationDate) return false;
    return (
      differenceInHours(new Date(), new Date(user.lastSkillsGenerationDate)) <=
      24
    );
  }, [user?.lastSkillsGenerationDate]);

  const updateCountdown = useCallback(() => {
    if (!user?.lastSkillsGenerationDate) return;

    const lastDate = new Date(user.lastSkillsGenerationDate);
    const nextAvailableDate = new Date(
      lastDate.getTime() + 24 * 60 * 60 * 1000
    );
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
    }
    setTimeLeft(null);
  }, [cantGenerateSkills, updateCountdown]);

  const buttonText = useMemo(() => {
    if (isPending) return "Generating suggestions...";
    if (cantGenerateSkills)
      return `Wait ${timeLeft || "24h"} for next generation`;
    return !user?.aiSuggestionSkills || user.aiSuggestionSkills.length === 0
      ? "Generate AI Suggestions"
      : "Regenerate";
  }, [isPending, cantGenerateSkills, user?.aiSuggestionSkills, timeLeft]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <Card className="p-8">
        <div className="flex flex-col items-start gap-6 md:flex-row">
          <UserAvatar
            name={user.name}
            imageUrl={user.imageUrl}
            size="xl"
            className="size-24"
          />
          <div className="flex w-full flex-col gap-3 md:max-w-xl">
            <h1 className="text-3xl font-bold leading-9 text-foreground">
              {user.name}
            </h1>
            {user.bio ? (
              <p className="text-muted-foreground">{user.bio}</p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="mt-1 w-fit gap-2"
              onClick={() => setIsEditing(true)}
            >
              <Pencil size={18} />
              Edit Profile
            </Button>
          </div>
        </div>
      </Card>

      <AddSkills />

      <Card className="px-6 py-5">
        <CardHeader className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-2xl leading-6">
            AI Skill Suggestions
          </CardTitle>
          <Button
            type="button"
            className="min-w-[260px]"
            disabled={cantGenerateSkills || isPending}
            loading={isPending}
            onClick={() => getNewAiSuggestionSkills()}
          >
            {buttonText}
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          {isPending ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : user.aiSuggestionSkills && user.aiSuggestionSkills.length > 0 ? (
            user.aiSuggestionSkills.map((skill) => (
              <div
                key={skill}
                className="flex flex-col justify-between gap-4 border-b border-border py-3 last:border-0 md:flex-row md:items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/20">
                    <GraduationCap className="text-primary" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold leading-7">{skill}</h3>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0"
                  onClick={() => addNewSkillToLearn(skill)}
                >
                  Add to Learn
                </Button>
              </div>
            ))
          ) : (
            <span className="py-8 text-center italic text-muted-foreground">
              {cantGenerateSkills
                ? "No skills to suggest right now. Come back once the timer runs out!"
                : "No suggestions found. Try regenerating!"}
            </span>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
