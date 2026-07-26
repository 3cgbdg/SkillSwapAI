"use client";

import ChatsService from "@/services/ChatsService";
import ProfilesService from "@/services/ProfilesService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, MessageSquareMore } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { showErrorToast } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const { id } = useParams() as { id: string };
  const queryClient = useQueryClient();
  const router = useRouter();
  const {
    data: profile,
    error,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => ProfilesService.getProfileById(id),
  });

  useEffect(() => {
    if (isError) {
      showErrorToast(error?.message || "An error occurred");
    }
  }, [error, isError]);

  const { mutate: createChat } = useMutation({
    mutationFn: async ({
      payload,
    }: {
      payload: { friendId: string; friendName: string };
    }) => ChatsService.createChat(payload),
    onSuccess: (data) => {
      router.push(`/chats/${data.chatId}`);
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: (err: Error) => {
      showErrorToast(err.message);
    },
  });

  if (isLoading || !profile) {
    return (
      <div className="grid grid-cols-5 gap-6 md:grid">
        <Card className="col-span-3 p-6">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="size-24 rounded-full" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-10 w-64" />
          </div>
        </Card>
        <div className="col-span-2 hidden flex-col gap-8 md:flex">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const skillBadge = (title: string, key: string) => (
    <Badge key={key} variant="teach" className="py-2">
      {title}
    </Badge>
  );

  const skillsSection = (
    <>
      <Card className="flex flex-col p-6 pt-[21px]">
        <CardHeader className="mb-4 p-0">
          <CardTitle className="text-2xl leading-6">Skills I Know</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 p-0">
          {profile.knownSkills?.length ? (
            profile.knownSkills.map((skill) =>
              skillBadge(skill.title, skill.id)
            )
          ) : (
            <span className="font-medium leading-5">No skills yet</span>
          )}
        </CardContent>
      </Card>
      <Card className="flex flex-col p-6 pt-[21px]">
        <CardHeader className="mb-4 p-0">
          <CardTitle className="text-2xl leading-6">
            Skills I Want to Learn
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 p-0">
          {profile.skillsToLearn?.length ? (
            profile.skillsToLearn.map((skill) =>
              skillBadge(skill.title, skill.id)
            )
          ) : (
            <span className="font-medium leading-5">No skills yet</span>
          )}
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="flex items-start justify-center gap-6 md:grid md:grid-cols-5">
      <Card className="col-span-3 p-6">
        <div className="flex flex-col items-center gap-4">
          <UserAvatar
            name={profile.name}
            imageUrl={profile.imageUrl}
            size="xl"
          />
          <h1 className="text-3xl font-bold leading-9">{profile.name}</h1>
          {profile.bio ? (
            <div className="w-full">
              <h3 className="text-lg leading-7">Bio:</h3>
              <p className="text-sm text-muted-foreground">{profile.bio}</p>
            </div>
          ) : null}
          <div className="flex w-full flex-col gap-2">
            <h3 className="text-lg leading-7">Actions:</h3>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <Button
                className="gap-5"
                onClick={() =>
                  createChat({
                    payload: { friendId: id, friendName: profile.name },
                  })
                }
              >
                <MessageSquareMore size={20} />
                Message {profile.name}
              </Button>
              <Button
                variant="outline"
                className="gap-5"
                onClick={() =>
                  router.push(
                    `/calendar?schedule=true&name=${encodeURIComponent(profile.name)}`
                  )
                }
              >
                <Calendar size={20} />
                Schedule Session
              </Button>
            </div>
          </div>
          <div className="flex w-full flex-col gap-8 md:hidden">
            {skillsSection}
          </div>
        </div>
      </Card>
      <div className="col-span-2 hidden flex-col gap-8 md:flex">
        {skillsSection}
      </div>
    </div>
  );
};

export default Page;
