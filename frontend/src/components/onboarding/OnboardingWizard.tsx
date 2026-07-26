"use client";

import SkillsService from "@/services/SkillsService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import useProfile from "@/hooks/useProfile";
import { cn } from "@/lib/utils";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

const FALLBACK_TEACH = ["JavaScript", "Python", "Design", "Spanish", "Guitar"];
const FALLBACK_LEARN = [
  "React",
  "Public Speaking",
  "Cooking",
  "Photography",
  "SQL",
];
const AVAILABILITY = [
  "Weekday evenings",
  "Weekend mornings",
  "Flexible",
  "Lunch breaks",
];

export function OnboardingWizard() {
  const { data: user } = useProfile();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [teach, setTeach] = useState<string[]>([]);
  const [learn, setLearn] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);

  const suggestions = useMemo(() => {
    const ai = user?.aiSuggestionSkills?.filter(Boolean) ?? [];
    return {
      teach: ai.length ? ai.slice(0, 6) : FALLBACK_TEACH,
      learn: ai.length ? ai.slice(0, 6) : FALLBACK_LEARN,
    };
  }, [user?.aiSuggestionSkills]);

  const addKnown = useMutation({
    mutationFn: (title: string) => SkillsService.addKnownSkill(title),
    onError: (err: Error) => showErrorToast(err.message),
  });
  const addLearn = useMutation({
    mutationFn: (title: string) => SkillsService.addWantToLearnSkill(title),
    onError: (err: Error) => showErrorToast(err.message),
  });

  if (dismissed) return null;

  const progress = ((step + 1) / 3) * 100;

  const toggle = (
    list: string[],
    setList: (v: string[]) => void,
    value: string
  ) => {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    );
  };

  const finish = async () => {
    try {
      await Promise.all([
        ...teach.map((t) => addKnown.mutateAsync(t)),
        ...learn.map((t) => addLearn.mutateAsync(t)),
      ]);
      if (availability.length) {
        try {
          localStorage.setItem(
            "skillswap:availability",
            JSON.stringify(availability)
          );
        } catch {
          /* ignore */
        }
      }
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      showSuccessToast("You're set — exploring matches next");
      setDismissed(true);
      router.push("/matches");
    } catch {
      /* toasts already shown */
    }
  };

  return (
    <Card elevation="raised" className="border-primary/20 overflow-hidden">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="text-brand-accent size-5" />
            <CardTitle className="text-lg">Get started in 3 steps</CardTitle>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
          >
            Skip
          </Button>
        </div>
        <CardDescription>
          Step {step + 1} of 3 —{" "}
          {step === 0
            ? "What can you teach?"
            : step === 1
              ? "What do you want to learn?"
              : "When are you free?"}
        </CardDescription>
        <Progress value={progress} />
      </CardHeader>
      <CardContent>
        {step === 0 ? (
          <ChipGrid
            options={suggestions.teach}
            selected={teach}
            onToggle={(v) => toggle(teach, setTeach, v)}
            variant="teach"
          />
        ) : null}
        {step === 1 ? (
          <ChipGrid
            options={suggestions.learn}
            selected={learn}
            onToggle={(v) => toggle(learn, setLearn, v)}
            variant="learn"
          />
        ) : null}
        {step === 2 ? (
          <ChipGrid
            options={AVAILABILITY}
            selected={availability}
            onToggle={(v) => toggle(availability, setAvailability, v)}
            variant="status"
          />
        ) : null}
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Back
        </Button>
        {step < 2 ? (
          <Button
            type="button"
            disabled={step === 0 ? teach.length === 0 : learn.length === 0}
            onClick={() => setStep((s) => s + 1)}
          >
            Continue
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            loading={addKnown.isPending || addLearn.isPending}
            onClick={finish}
          >
            <Check className="size-4" />
            Finish & find matches
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function ChipGrid({
  options,
  selected,
  onToggle,
  variant,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  variant: "teach" | "learn" | "status";
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={cn(
              "rounded-full transition-transform duration-[var(--duration-fast)] active:scale-[0.98]",
              active &&
                "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
          >
            <Badge
              variant={active ? "default" : variant}
              className="px-3 py-1.5"
            >
              {active ? <Check className="size-3" /> : null}
              {option}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
