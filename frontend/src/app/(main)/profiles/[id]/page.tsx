"use client";

import { ProfileView } from "@/components/profile/ProfileView";
import ChatsService from "@/services/ChatsService";
import ProfilesService from "@/services/ProfilesService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, MessageSquareMore } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { AsyncBoundary } from "@/components/composites";
import { Button } from "@/components/ui/button";

export default function PublicProfilePage() {
  const { id } = useParams() as { id: string };
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: profile,
    isError,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["profile", id],
    queryFn: () => ProfilesService.getProfileById(id),
  });

  const { mutate: createChat } = useMutation({
    mutationFn: async ({
      payload,
    }: {
      payload: { friendId: string; friendName: string };
    }) => ChatsService.createChat(payload),
    onSuccess: (data) => {
      router.push(`/inbox/${data.chatId}`);
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  return (
    <AsyncBoundary isLoading={isLoading} isError={isError} error={error}>
      {profile ? (
        <ProfileView
          profile={profile}
          actions={
            <>
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
                    `/schedule?schedule=true&name=${encodeURIComponent(profile.name)}`
                  )
                }
              >
                <Calendar size={20} />
                Schedule Session
              </Button>
            </>
          }
        />
      ) : null}
    </AsyncBoundary>
  );
}
