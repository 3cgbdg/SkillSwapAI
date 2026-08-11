"use client";

import AddSkills from "@/components/profile/AddSkills";
import AiService from "@/services/AiService";
import SkillsService from "@/services/SkillsService";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import useProfile from "@/hooks/useProfile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { differenceInHours, intervalToDuration } from "date-fns";
import { BookOpen, GraduationCap } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SectionPanel, StatTile } from "@/components/composites";
import { ProfileView } from "@/components/profile/ProfileView";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const Profile = () => {
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
      <ProfileView profile={user} editHref="/profile/edit" />

      <div className="grid gap-3 sm:grid-cols-2">
        <StatTile
          icon={GraduationCap}
          label="Skills I teach"
          value={user.knownSkills?.length ?? 0}
        />
        <StatTile
          icon={BookOpen}
          label="Skills to learn"
          value={user.skillsToLearn?.length ?? 0}
        />
      </div>

      <AddSkills />

      <SectionPanel title="AI Skill Suggestions">
        <div className="mb-4 flex justify-end">
          <Button
            type="button"
            className="min-w-[260px]"
            disabled={cantGenerateSkills || isPending}
            loading={isPending}
            onClick={() => getNewAiSuggestionSkills()}
          >
            {buttonText}
          </Button>
        </div>
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
                <div className="bg-primary/20 flex size-10 items-center justify-center rounded-full">
                  <GraduationCap className="text-primary" size={20} />
                </div>
                <h3 className="text-lg leading-7 font-semibold">{skill}</h3>
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
          <span className="text-muted-foreground py-8 text-center italic">
            {cantGenerateSkills
              ? "No skills to suggest right now. Come back once the timer runs out!"
              : "No suggestions found. Try regenerating!"}
          </span>
        )}
      </SectionPanel>
    </div>
  );
};

export default Profile;
