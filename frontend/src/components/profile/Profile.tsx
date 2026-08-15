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
import { SectionPanel, StatTile, UserRow } from "@/components/composites";
import { PageBody, PageHeader } from "@/components/layouts";
import { ProfileView } from "@/components/profile/ProfileView";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
    <PageBody>
      <PageHeader
        title="Your profile"
        description="Manage the skills you teach and the ones you're learning."
      />
      <ProfileView profile={user} editHref="/profile/edit" />

      <div className="grid gap-4 sm:grid-cols-2">
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
            className="min-w-60"
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
          <div className="flex flex-col gap-4">
            {user.aiSuggestionSkills.map((skill) => (
              <UserRow
                key={skill}
                media={
                  <Avatar className="size-10 bg-primary/20">
                    <AvatarFallback className="bg-transparent">
                      <GraduationCap className="text-primary" size={20} />
                    </AvatarFallback>
                  </Avatar>
                }
                title={skill}
                actions={
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => addNewSkillToLearn(skill)}
                  >
                    Add to Learn
                  </Button>
                }
              />
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground py-8 text-center italic">
            {cantGenerateSkills
              ? "No skills to suggest right now. Come back once the timer runs out!"
              : "No suggestions found. Try regenerating!"}
          </span>
        )}
      </SectionPanel>
    </PageBody>
  );
};

export default Profile;
