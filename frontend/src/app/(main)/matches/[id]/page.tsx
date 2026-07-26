"use client";

import ModuleAccordion from "@/components/matches/ModuleAccordion";
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
      router.push(`/chats/${data.chatId}`);
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

  useEffect(() => {
    if (isError) {
      showErrorToast(error?.message || "An error occurred");
    }
  }, [isError, error]);

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
    <div className="flex flex-col gap-8">
      <Dialog open={isLoading}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm">
          <DialogTitle className="sr-only">Loading plan</DialogTitle>
          <DialogDescription className="flex justify-center py-4">
            <Spinner size="xl" />
          </DialogDescription>
        </DialogContent>
      </Dialog>

      <div className="grid gap-8 grid-cols-3">
        <Card className="col-span-3 gap-4 bg-gradient-to-br from-surface-raised to-accent/15 p-8 xl:col-span-2">
          <CardHeader className="p-0">
            <CardTitle className="text-3xl font-bold leading-9">
              Your AI-Powered Training Plan with {currentMatch.other.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-0">
            <p>{currentMatch.aiExplanation}</p>
            {currentMatch.keyBenefits?.length ? (
              <div className="flex flex-col gap-2">
                <h3 className="text-xl leading-7 font-semibold">Benefits:</h3>
                <ol className="list-disc pl-5">
                  {currentMatch.keyBenefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ol>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="col-span-3 h-fit p-6 sm:col-span-2 xl:col-span-1">
          <CardContent className="flex flex-col gap-7 p-0 md:flex-col md:items-center md:gap-4">
            <div className="flex basis-full flex-col items-center gap-4">
              <UserAvatar
                name={currentMatch.other.name}
                imageUrl={currentMatch.other.imageUrl}
                size="xl"
              />
              <h2 className="text-2xl font-bold leading-8">
                {currentMatch.other.name}
              </h2>
            </div>
            <div className="mt-4 flex w-full flex-col gap-3">
              <Button
                className="justify-start gap-5"
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
                className="justify-start gap-5"
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

        <Card className="col-span-3 flex h-[254px] items-center justify-center p-6 text-center sm:col-span-1 xl:col-span-2">
          <CardContent className="flex flex-col items-center gap-4 p-0">
            {plan ? (
              <div className="flex w-full max-w-sm flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-2xl font-bold leading-8">
                    Overall Progress
                  </h2>
                  <p className="text-sm leading-5 text-muted-foreground">
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
          </CardContent>
        </Card>
      </div>

      {plan ? (
        <Card className="w-full p-6">
          <CardHeader className="mb-6 p-0">
            <CardTitle className="text-3xl font-bold leading-9">
              Training Modules
            </CardTitle>
            <CardDescription>
              Breakdown of your skill exchange journey
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-0">
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
      ) : null}
    </div>
  );
};

export default Page;
