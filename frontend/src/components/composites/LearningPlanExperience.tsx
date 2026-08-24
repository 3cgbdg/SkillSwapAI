"use client";

import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  MessageSquareMore,
  Sparkles,
  Video,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

import ModuleAccordion from "@/components/matches/ModuleAccordion";
import { PageBody, PageHeader } from "@/components/layouts";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { IGeneratedPlan, IGeneratedModule } from "@/types/plan";
import type { IMatch } from "@/types/match";

export function LearningPlanExperience({
  match,
  plan,
  progressPercent,
  openModule,
  setOpenModule,
  onMessage,
  onSchedule,
}: {
  match: IMatch;
  plan: IGeneratedPlan | undefined;
  progressPercent: number;
  openModule: string[];
  setOpenModule: Dispatch<SetStateAction<string[]>>;
  onMessage: () => void;
  onSchedule: () => void;
}) {
  const completedModules =
    plan?.modules.filter((module) => module.status !== "INPROGRESS").length ??
    0;
  const totalWeeks =
    plan?.modules.reduce(
      (total, module) => total + (module.timeline ?? 0),
      0
    ) ?? 0;
  const teachSkills = match.other.skillsToLearn.slice(0, 2);
  const learnSkills = match.other.knownSkills.slice(0, 2);

  return (
    <PageBody>
      <PageHeader
        eyebrow={
          <span className="text-primary flex items-center gap-2 font-semibold">
            <Sparkles className="size-4" /> AI-generated learning journey
          </span>
        }
        title={`Your exchange with ${match.other.name}`}
        description="A two-way plan with clear modules, practical outcomes, and the conversation tools to keep both people moving."
        actions={
          <Button variant="outline" onClick={onSchedule}>
            <Calendar className="size-4" />
            Schedule session
          </Button>
        }
      />

      <Card
        className="relative overflow-hidden border-primary/25 bg-gradient-to-br from-primary/10 via-card to-brand-accent/10"
        elevation="raised"
      >
        <div
          aria-hidden
          className="absolute -right-20 -top-28 size-80 rounded-full bg-primary/10 blur-3xl"
        />
        <CardContent className="relative grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            <p className="text-primary flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4" />
              AI learning plan
            </p>
            <h2 className="mt-4 font-heading text-3xl font-bold">
              Build, teach, and ship together
            </h2>
            <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-6">
              {match.aiExplanation ||
                `SkillSwap created a structured exchange around your complementary skills with ${match.other.name}.`}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {teachSkills.map((skill) => (
                <span
                  key={skill.title}
                  className="bg-accent-teach-soft text-accent-teach rounded-full px-3 py-1.5 text-xs font-semibold"
                >
                  You teach {skill.title}
                </span>
              ))}
              {learnSkills.map((skill) => (
                <span
                  key={skill.title}
                  className="bg-accent-learn-soft text-accent-learn rounded-full px-3 py-1.5 text-xs font-semibold"
                >
                  You learn {skill.title}
                </span>
              ))}
            </div>
          </div>
          <Card className="bg-card/95" elevation="raised" size="sm">
            <CardContent>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-muted-foreground text-xs font-semibold">
                    Overall progress
                  </p>
                  <p className="mt-1 text-3xl font-bold tabular-nums">
                    {progressPercent}%
                  </p>
                </div>
                <CheckCircle2 className="text-primary size-6" />
              </div>
              <Progress value={progressPercent} className="mt-4">
                <ProgressTrack className="h-2">
                  <ProgressIndicator />
                </ProgressTrack>
              </Progress>
              <p className="text-muted-foreground mt-3 text-xs">
                {completedModules} of {plan?.modules.length ?? 0} modules
                complete
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Learning modules</CardTitle>
                <p className="text-muted-foreground mt-1 text-xs">
                  Your personalized sequence from foundation to practical work
                </p>
              </div>
              <BookOpen className="text-primary size-5" />
            </div>
          </CardHeader>
          <CardContent>
            {plan ? (
              <Accordion
                value={openModule}
                onValueChange={setOpenModule}
                className="gap-3"
              >
                {plan.modules.map((module: IGeneratedModule, index: number) => (
                  <ModuleAccordion
                    planId={plan.id}
                    key={module.id}
                    module={module}
                    itemValue={String(index)}
                  />
                ))}
              </Accordion>
            ) : null}
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center text-center">
              <UserAvatar
                name={match.other.name}
                imageUrl={match.other.imageUrl}
                size="xl"
              />
              <h2 className="mt-3 font-heading text-lg font-bold">
                {match.other.name}
              </h2>
              <p className="text-muted-foreground mt-1 text-xs">
                {match.compatibility}% compatible skill partner
              </p>
              <div className="mt-5 grid w-full gap-2">
                <Button onClick={onMessage}>
                  <MessageSquareMore className="size-4" />
                  Open conversation
                </Button>
                <Button variant="outline" onClick={onSchedule}>
                  <Video className="size-4" />
                  Plan next session
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="text-brand-accent size-4" />
                AI plan insight
              </p>
              <p className="text-muted-foreground mt-2 text-xs leading-5">
                {totalWeeks
                  ? `${totalWeeks} total learning weeks across ${plan?.modules.length ?? 0} focused modules.`
                  : "Your modules adapt as you complete the current learning work."}
              </p>
              {match.keyBenefits?.[0] ? (
                <p className="text-muted-foreground mt-3 text-xs leading-5">
                  {match.keyBenefits[0]}
                </p>
              ) : null}
              <button
                type="button"
                onClick={onMessage}
                className="text-primary mt-4 flex items-center gap-2 text-xs font-semibold"
              >
                Discuss the plan <ArrowRight className="size-3.5" />
              </button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageBody>
  );
}
