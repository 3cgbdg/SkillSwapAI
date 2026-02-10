"use client";

import FullSreenLoader from "@/components/FullSreenLoader";
import ModuleAccordion from "@/components/matches/ModuleAccordion";
import Spinner from "@/components/Spinner";
import ChatsService from "@/services/ChatsService";
import PlansService from "@/services/PlansService";
import { IChat, IGeneratedModule, IMatch } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, MessageSquareMore, UserRound } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useMatches from "@/hooks/useMatches";

const Page = () => {
  const { id } = useParams() as { id: string };
  const { data: matches = [] } = useMatches();
  const [currentMatch, setCurrentMatch] = useState<IMatch | null>(null);
  const [isActive, setIsActive] = useState<null | number>(null);
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

  // for getting to chat or creating it
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
    onError: (err) => {
      toast.error(err.message);
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

  // handling api error

  useEffect(() => {
    if (isError) {
      toast.error(error.message);
    }
  }, [isError, error]);

  return (
    <>
      {currentMatch ? (
        <div className="flex flex-col gap-8">
          {/* loading screen */}

          {isLoading && <FullSreenLoader />}

          {/*  */}
          <div className="grid gap-8 grid-cols-3">
            <div className="_border rounded-[10px] col-span-3 xl:col-span-2 banner_gradient flex flex-col gap-4  p-8">
              <div className="flex flex-col gap-2">
                <h1 className="page-title">
                  Your AI-Powered Training Plan with {currentMatch.other.name}
                </h1>
              </div>
              <div className="">{currentMatch.aiExplanation}</div>
              {currentMatch.keyBenefits && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl leading-7 font-semibold">Benefits:</h3>
                  <ol className="list-disc">
                    <li>{currentMatch.keyBenefits[0]}</li>
                    <li>{currentMatch.keyBenefits[1]}</li>
                    <li>{currentMatch.keyBenefits[2]}</li>
                    <li>{currentMatch.keyBenefits[3]}</li>
                  </ol>
                </div>
              )}
            </div>
            <div className="_border rounded-[10px] col-span-3 sm:col-span-2  h-fit  xl:col-span-1 p-6">
              <div className="flex md:flex-col gap-7 md:gap-4 md:items-center">
                <div className="flex flex-col gap-4 items-center basis-full">
                  <div className=" _border size-24 relative  flex items-center justify-center rounded-full overflow-hidden">
                    {!currentMatch.other.imageUrl ? (
                      <UserRound size={24} />
                    ) : (
                      <Image
                        className="object-cover"
                        src={currentMatch.other.imageUrl}
                        fill
                        alt="user image"
                      />
                    )}
                  </div>
                  <h2 className="section-title">{currentMatch.other.name}</h2>
                </div>
                <div className="flex flex-col gap-3 mt-4 w-full">
                  <button
                    onClick={() =>
                      createChat({
                        payload: {
                          friendId: currentMatch.other.id,
                          friendName: currentMatch.other.name,
                        },
                      })
                    }
                    className="button-blue flex items-center gap-5"
                  >
                    <MessageSquareMore size={20} />
                    <span>Message {currentMatch.other.name}</span>
                  </button>
                  <button
                    onClick={() =>
                      router.push(
                        `/calendar?schedule=true&name=${encodeURIComponent(currentMatch.other.name)}`
                      )
                    }
                    className="button-transparent rounded-md! flex items-center gap-5"
                  >
                    <Calendar size={20} />
                    <span>Schedule Session</span>
                  </button>
                </div>
              </div>
            </div>
            {/* todo touch screen optimization */}
            <div className="_border col-span-3 sm:col-span-1   xl:col-span-2 rounded-[10px]  p-6 h-[254px] flex items-center justify-center text-center">
              <div className="flex flex-col gap-4 items-center">
                {plan && (
                  <div className="flex flex-col  gap-1.5">
                    <h2 className="section-title">Overall Progress</h2>
                    <p className="tex-sm leading-5 text-gray">
                      Your AI-generated training journey
                    </p>
                    <h3 className="page-title mt-4 text-blue!">
                      {(plan.modules.reduce(
                        (acc: number, cur: IGeneratedModule) =>
                          acc + (cur.status == "INPROGRESS" ? 0 : 1),
                        0
                      ) /
                        plan.modules.length) *
                        100}
                      %
                    </h3>
                  </div>
                )}
              </div>
            </div>
          </div>

          {plan && (
            <div className="w-full _border rounded-[10px] p-6">
              <div className="flex flex-col gap-2 mb-6">
                <h2 className="page-title">Training Modules</h2>
                <p className="text-sm leading-5 text-gray">
                  Breakdown of your skill exchange journey
                </p>
              </div>
              <div className="flex flex-col gap-4">
                {plan &&
                  plan.modules.map((module: IGeneratedModule, idx: number) => (
                    <ModuleAccordion
                      planId={plan.id}
                      idx={idx}
                      key={module.id}
                      module={module}
                      isActive={isActive}
                      setIsActive={setIsActive}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="h-100 flex items-center justify-center">
          <Spinner color="blue" size={44} />
        </div>
      )}
    </>
  );
};

export default Page;
