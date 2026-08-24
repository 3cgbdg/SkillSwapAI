"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AsyncBoundary } from "@/components/composites";
import { LearningPlanExperience } from "@/components/composites/LearningPlanExperience";
import { Spinner } from "@/components/ui/spinner";
import useMatches from "@/hooks/useMatches";
import ChatsService from "@/services/ChatsService";
import PlansService from "@/services/PlansService";
import type { IChat, IGeneratedModule } from "@/types/types";
import { showErrorToast } from "@/utils/toast";

export default function MatchPlanPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: matches = [], isLoading: matchesLoading } = useMatches();
  const [openModule, setOpenModule] = useState<string[]>([]);

  const currentMatch = useMemo(
    () => matches.find((match) => match.id === id) ?? null,
    [matches, id]
  );

  useEffect(() => {
    if (!matchesLoading && !currentMatch) router.replace("/learning");
  }, [currentMatch, matchesLoading, router]);

  const {
    data: plan,
    isError,
    error,
    isLoading: planLoading,
  } = useQuery({
    queryKey: ["matches", id],
    queryFn: () => PlansService.getPlan(currentMatch?.id),
    enabled: Boolean(currentMatch),
  });

  const progressPercent = useMemo(() => {
    if (!plan?.modules.length) return 0;
    const completed = plan.modules.reduce(
      (total: number, module: IGeneratedModule) =>
        total + (module.status === "INPROGRESS" ? 0 : 1),
      0
    );
    return Math.round((completed / plan.modules.length) * 100);
  }, [plan]);

  const { mutate: createChat } = useMutation({
    mutationFn: (payload: { friendId: string; friendName: string }) =>
      ChatsService.createChat(payload),
    onSuccess: (chat) => {
      queryClient.setQueryData(["chats"], (old: IChat[] = []) =>
        old.some((item) => item.chatId === chat.chatId) ? old : [chat, ...old]
      );
      router.push(`/inbox/${chat.chatId}`);
    },
    onError: (mutationError: Error) => showErrorToast(mutationError.message),
  });

  if (matchesLoading || !currentMatch) {
    return (
      <div className="flex h-100 items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <AsyncBoundary
      isLoading={planLoading}
      isError={isError}
      error={error}
      loadingFallback={
        <div className="flex h-100 items-center justify-center">
          <Spinner size="xl" />
        </div>
      }
    >
      <LearningPlanExperience
        match={currentMatch}
        plan={plan ?? undefined}
        progressPercent={progressPercent}
        openModule={openModule}
        setOpenModule={setOpenModule}
        onMessage={() =>
          createChat({
            friendId: currentMatch.other.id,
            friendName: currentMatch.other.name,
          })
        }
        onSchedule={() =>
          router.push(
            `/schedule?schedule=true&name=${encodeURIComponent(currentMatch.other.name)}`
          )
        }
      />
    </AsyncBoundary>
  );
}
