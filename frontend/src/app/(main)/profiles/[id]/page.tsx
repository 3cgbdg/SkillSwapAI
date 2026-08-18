"use client";

import { ProfileView } from "@/components/profile/ProfileView";
import ChatsService from "@/services/ChatsService";
import ProfilesService from "@/services/ProfilesService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, MessageSquareMore } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { AsyncBoundary, SkeletonKit } from "@/components/composites";
import { PageBody, PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { useUserReviews } from "@/hooks/useReviews";

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

  const { data: reviewsResult, isLoading: reviewsLoading } = useUserReviews(id);

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
    <AsyncBoundary
      isLoading={isLoading}
      isError={isError}
      error={error}
      loadingFallback={<SkeletonKit.PublicProfileGrid />}
    >
      {profile ? (
        <PageBody>
          <PageHeader title={`${profile.name}'s profile`} />
          <ProfileView
            profile={profile}
            reviews={{
              items: reviewsResult?.reviews ?? [],
              isLoading: reviewsLoading,
            }}
            actions={
              <>
                <Button
                  className="gap-2"
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
                  className="gap-2"
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
        </PageBody>
      ) : null}
    </AsyncBoundary>
  );
}
