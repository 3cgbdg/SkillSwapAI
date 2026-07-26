"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { Found, FoundSkills, FoundUsers } from "@/types/common";
import { IRequest } from "@/types/session";
import AuthService from "@/services/AuthService";
import RequestsService from "@/services/RequestsService";
import SearchService from "@/services/SearchService";
import SkillsService from "@/services/SkillsService";
import { ThemeToggle } from "@/components/ui/theme-toggle";

import HeaderLogo from "./headerComponents/HeaderLogo";
import SearchInput from "./headerComponents/SearchInput";
import SearchInputMobile from "./headerComponents/SearchInputMobile";
import NotificationsBell from "./headerComponents/NotificationsBell";
import AvatarMenu from "./headerComponents/AvatarMenu";
import NavigationMenu from "./headerComponents/NavigationMenu";
import { showErrorToast } from "@/utils/toast";
import useFriends from "@/hooks/useFriends";

const Header = () => {
  const router = useRouter();
  const [word, setWord] = useState<string>("");
  const [foundUsers, setFoundUsers] = useState<FoundUsers[]>([]);
  const [foundSkills, setFoundSkills] = useState<FoundSkills[]>([]);
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const { addFriend, createFriendRequest } = useFriends();
  // log out
  const mutation = useMutation({
    mutationFn: async () => await AuthService.logOut(),
    onSuccess: () => {
      queryClient.clear();
      router.push("/auth/login");
    },
  });

  // get requests
  const {
    data: reqs,
    isError,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["reqs"],
    queryFn: async () => RequestsService.getRequests(),
  });
  // handling api error
  useEffect(() => {
    if (isError) {
      showErrorToast(error?.message || "An error occurred");
    }
  }, [isError, error]);

  // add a new friend

  // search with chars (dynamically)
  const mutationSearch = useMutation({
    mutationFn: async (chars: string) => {
      const res = await SearchService.searchUsersAndSkillsByChars(chars);
      return res as Found[];
    },
    onSuccess: (data) => {
      setFoundUsers(() => data.filter((item) => item.name !== undefined));
      setFoundSkills(() => data.filter((item) => item.title !== undefined));
    },
    onError: (err: Error) => {
      showErrorToast(err.message);
    },
  });

  // adding skill (want to learn)
  const mutationAddLearn = useMutation({
    mutationFn: async (str: string) => SkillsService.addWantToLearnSkill(str),
    onError: (err: Error) => {
      showErrorToast(err.message);
    },
  });

  // accept session-request
  const mutationAcceptSession = useMutation({
    mutationFn: async ({
      sessionId,
      requestId,
      friendId,
    }: {
      sessionId: string;
      requestId: string;
      friendId: string;
    }) =>
      RequestsService.acceptSessionRequest({ sessionId, requestId, friendId }),
    onSuccess: (id: string) => {
      queryClient.setQueryData(["reqs"], (old: IRequest[]) => {
        if (!old) return [];
        return old.filter((req: IRequest) => req.id !== id);
      });
    },
  });

  // reject session-request
  const mutationRejectSession = useMutation({
    mutationFn: async ({
      sessionId,
      requestId,
      friendId,
    }: {
      sessionId: string;
      requestId: string;
      friendId: string;
    }) =>
      RequestsService.rejectSessionRequest({ sessionId, requestId, friendId }),
    onSuccess: (id: string) => {
      queryClient.setQueryData(["reqs"], (old: IRequest[]) => {
        if (!old) return [];
        return old.filter((req: IRequest) => req.id !== id);
      });
    },
  });

  // delete request
  const mutationRequestDelete = useMutation({
    mutationFn: async ({ requestId }: { requestId: string }) =>
      RequestsService.deleteRequest(requestId),
    onSuccess: (id: string) => {
      queryClient.setQueryData(["reqs"], (old: IRequest[]) => {
        if (!old) return [];
        return old.filter((req: IRequest) => req.id !== id);
      });
    },
    onError: (err: Error) => {
      showErrorToast(err.message);
    },
  });

  // socket is provided by `SocketProvider` via context

  // connecting socket for tracking requests (use socket from context)
  useEffect(() => {
    if (!socket) return;

    const onFriendRequest = (payload: { request: IRequest }) => {
      queryClient.setQueryData(["reqs"], (old: IRequest[]) => {
        return [...(old ?? []), payload.request];
      });
    };

    const onSessionCreationRequest = (payload: { request: IRequest }) => {
      queryClient.setQueryData(["reqs"], (old: IRequest[]) => {
        return [...(old ?? []), payload.request];
      });
    };

    const onSessionAcceptedRequest = (payload: { request: IRequest }) => {
      queryClient.setQueryData(["reqs"], (old: IRequest[]) => {
        return [...(old ?? []), payload.request];
      });
    };

    const onSessionRejectedRequest = (payload: { request: IRequest }) => {
      queryClient.setQueryData(["reqs"], (old: IRequest[]) => {
        return [...(old ?? []), payload.request];
      });
    };

    socket.on("friendRequest", onFriendRequest);
    socket.on("sessionCreationRequest", onSessionCreationRequest);
    socket.on("sessionAcceptedRequest", onSessionAcceptedRequest);
    socket.on("sessionRejectedRequest", onSessionRejectedRequest);

    return () => {
      socket.off("friendRequest", onFriendRequest);
      socket.off("sessionCreationRequest", onSessionCreationRequest);
      socket.off("sessionAcceptedRequest", onSessionAcceptedRequest);
      socket.off("sessionRejectedRequest", onSessionRejectedRequest);
    };
  }, [socket, queryClient]);

  return (
    <header className="border-border bg-card relative flex items-center justify-between border-b px-2 py-3 md:px-6">
      <div className="flex grow items-center gap-6">
        <HeaderLogo />
      </div>

      <SearchInputMobile
        word={word}
        foundUsers={foundUsers}
        foundSkills={foundSkills}
        onWordChange={setWord}
        isPending={mutationSearch.isPending}
        onSearch={async (chars) => {
          await mutationSearch.mutateAsync(chars);
        }}
        onAddLearn={(skill) => {
          mutationAddLearn.mutate(skill);
          queryClient.setQueryData(["profile"], (old: any) => {
            if (!old) return old;
            const newItem = {
              id: "temporary-id",
              title: skill,
            };
            return {
              ...old,
              skillsToLearn: [...(old.skillsToLearn || []), newItem],
            };
          });
        }}
        onCreateFriendRequest={(userId) => createFriendRequest({ id: userId })}
        onRemoveSkill={(skillId) =>
          setFoundSkills((prev) => prev.filter((item) => item.id !== skillId))
        }
      />

      <div className="relative flex items-center gap-2 md:gap-4">
        <SearchInput
          word={word}
          foundUsers={foundUsers}
          isPending={mutationSearch.isPending}
          foundSkills={foundSkills}
          onWordChange={setWord}
          onSearch={async (chars) => {
            await mutationSearch.mutateAsync(chars);
          }}
          onAddLearn={(skill) => {
            mutationAddLearn.mutate(skill);
            queryClient.setQueryData(["profile"], (old: any) => {
              if (!old) return old;
              const newItem = {
                id: "temporary-id",
                title: skill,
              };
              return {
                ...old,
                skillsToLearn: [...(old.skillsToLearn || []), newItem],
              };
            });
          }}
          onCreateFriendRequest={(userId) =>
            createFriendRequest({ id: userId })
          }
          onRemoveSkill={(skillId) =>
            setFoundSkills((prev) => prev.filter((item) => item.id !== skillId))
          }
        />

        <NotificationsBell
          reqs={reqs}
          isLoading={isLoading}
          onAcceptSession={(data) => mutationAcceptSession.mutate(data)}
          onRejectSession={(data) => mutationRejectSession.mutate(data)}
          onAddFriend={(data) => addFriend(data)}
          onDeleteRequest={(data) => mutationRequestDelete.mutate(data)}
        />

        <ThemeToggle />

        <AvatarMenu onLogOut={() => mutation.mutate()} />

        <NavigationMenu onLogOut={() => mutation.mutate()} />
      </div>
    </header>
  );
};

export default Header;
