"use client";

import ModuleAccordion from "@/components/matches/ModuleAccordion";
import { AsyncBoundary, MatchProgressPanel } from "@/components/composites";
import { Spinner } from "@/components/ui/spinner";
import ChatsService from "@/services/ChatsService";
import PlansService from "@/services/PlansService";
import { IChat, IGeneratedModule, IMatch } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, MessageSquareMore } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { showErrorToast } from "@/utils/toast";
import useMatches from "@/hooks/useMatches";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import { Accordion } from "@/components/ui/accordion";
import { PageBody, PageHeader, PageSection } from "@/components/layouts";

const Page = () => {
  const { id } = useParams() as { id: string };
  const { data: matches = [] } = useMatches();
  const [currentMatch, setCurrentMatch] = useState<IMatch | null>(null);
  const [openModule, setOpenModule] = useState<string[]>([]);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!matches || matches.length == 0) return;
    const match = matches.find((item) => item.id == id);
    setCurrentMatch(match ?? null);
    if (!match) {
      router.push("/404");
    }
  }, [matches, id, router]);

  const { mutate: createChat } = useMutation({
    mutationFn: async ({
      payload,
    }: {
      payload: { friendId: string; friendName: string };
    }) => ChatsService.createChat(payload),
    onSuccess: (data) => {
      router.push(`/inbox/${data.chatId}`);
      queryClient.setQueryData(["chats"], (old: IChat[] = []) => {
        if (old.some((c) => c.chatId === data.chatId)) return old;
        return [data, ...old];
      });
    },
    onError: (err: Error) => {
      showErrorToast(err.message);
    },
  });

  const {
    data: plan,
    isError,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["matches", id],
    queryFn: async () => PlansService.getPlan(currentMatch?.id),
    enabled: !!currentMatch,
  });

  const progressPercent = useMemo(() => {
    if (!plan?.modules.length) return 0;
    const completed = plan.modules.reduce(
      (acc: number, cur: IGeneratedModule) =>
        acc + (cur.status == "INPROGRESS" ? 0 : 1),
      0
    );
    return Math.round((completed / plan.modules.length) * 100);
  }, [plan]);

  if (!currentMatch) {
    return (
      <div className="flex h-100 items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <AsyncBoundary isError={isError} error={error}>
      <PageBody>
        <Dialog open={isLoading}>
          <DialogContent showCloseButton={false} className="sm:max-w-sm">
            <DialogTitle className="sr-only">Loading plan</DialogTitle>
            <DialogDescription className="flex justify-center py-4">
              <Spinner size="xl" />
            </DialogDescription>
          </DialogContent>
        </Dialog>

        <PageHeader title={`Training plan with ${currentMatch.other.name}`} />

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <Card
            className="col-span-3 gap-4 bg-gradient-to-br from-surface-raised to-brand-accent/15 xl:col-span-2"
            elevation="raised"
          >
            <CardHeader>
              <CardTitle className="font-heading text-h3">
                Your AI-powered training plan
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p>{currentMatch.aiExplanation}</p>
              {currentMatch.keyBenefits?.length ? (
                <div className="flex flex-col gap-4">
                  <h3 className="font-heading text-h3">Key benefits</h3>
                  <ul className="list-disc pl-5">
                    {currentMatch.keyBenefits.map((benefit) => (
                      <li key={benefit}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="col-span-3 h-fit sm:col-span-2 xl:col-span-1">
            <CardContent className="flex flex-col items-center gap-4">
              <UserAvatar
                name={currentMatch.other.name}
                imageUrl={currentMatch.other.imageUrl}
                size="xl"
              />
              <h2 className="font-heading text-h2">
                {currentMatch.other.name}
              </h2>
              <div className="mt-4 flex w-full flex-col gap-4">
                <Button
                  className="justify-start gap-2"
                  onClick={() =>
                    createChat({
                      payload: {
                        friendId: currentMatch.other.id,
                        friendName: currentMatch.other.name,
                      },
                    })
                  }
                >
                  <MessageSquareMore size={20} />
                  Message {currentMatch.other.name}
                </Button>
                <Button
                  variant="outline"
                  className="justify-start gap-2"
                  onClick={() =>
                    router.push(
                      `/calendar?schedule=true&name=${encodeURIComponent(currentMatch.other.name)}`
                    )
                  }
                >
                  <Calendar size={20} />
                  Schedule Session
                </Button>
              </div>
            </CardContent>
          </Card>

          <MatchProgressPanel>
            {plan ? (
              <div className="flex w-full max-w-sm flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-heading text-h3">Overall progress</h3>
                  <p className="text-muted-foreground text-body-sm">
                    Your AI-generated training journey
                  </p>
                  <p className="mt-4 text-3xl font-bold text-primary">
                    {progressPercent}%
                  </p>
                </div>
                <Progress value={progressPercent}>
                  <ProgressTrack className="h-2">
                    <ProgressIndicator />
                  </ProgressTrack>
                </Progress>
              </div>
            ) : null}
          </MatchProgressPanel>
        </div>

        {plan ? (
          <PageSection title="Training modules">
            <Card className="w-full">
              <CardHeader>
                <CardDescription>
                  Breakdown of your skill exchange journey
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Accordion
                  value={openModule}
                  onValueChange={setOpenModule}
                  className="gap-4"
                >
                  {plan.modules.map((module: IGeneratedModule, idx: number) => (
                    <ModuleAccordion
                      planId={plan.id}
                      key={module.id}
                      module={module}
                      itemValue={String(idx)}
                    />
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </PageSection>
        ) : null}
      </PageBody>
    </AsyncBoundary>
  );
};

export default Page;
