"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { IUser } from "@/types/auth";
import { Found, FoundSkills, FoundUsers } from "@/types/common";
import { IRequest } from "@/types/session";
import AuthService from "@/services/AuthService";
import RequestsService from "@/services/RequestsService";
import SearchService from "@/services/SearchService";
import SkillsService from "@/services/SkillsService";

// Import sub-components
import HeaderLogo from "./headerComponents/HeaderLogo";
import SearchInput from "./headerComponents/SearchInput";
import SearchInputMobile from "./headerComponents/SearchInputMobile";
import NotificationsBell from "./headerComponents/NotificationsBell";
import AvatarMenu from "./headerComponents/AvatarMenu";
import NavigationMenu from "./headerComponents/NavigationMenu";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import useFriends from "@/hooks/useFriends";

const Header = () => {
  const [panel, setPanel] = useState<
    "avatarMenu" | "search" | "notifs" | "navMenu" | null
  >(null);
  const router = useRouter();
  const [word, setWord] = useState<string>("");
  const [foundUsers, setFoundUsers] = useState<FoundUsers[]>([]);
  const [foundSkills, setFoundSkills] = useState<FoundSkills[]>([]);
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const { addFriend, createFriendRequest } = useFriends();
  // log out
  const mutation = useMutation({
    mutationFn: async () => await AuthService.logOut(),
    onSuccess: () => {
      queryClient.clear();
      router.push("/auth/login");
    },
  });

  // event for tracking mouse clicking in order to close unnecessary panels
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (!target.closest(".panel")) {
        setPanel(null);
      }
    };

    if (panel) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [panel]);

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
    <div className="flex items-center justify-between bg-white py-[14px] px-2 md:px-6 relative ">
      <div className="flex items-center gap-6 grow">
        <HeaderLogo />
      </div>

      {/* Mobile Search Input */}
      <SearchInputMobile
        word={word}
        panel={panel}
        isSearchOpen={isSearchOpen}
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
        onPanelChange={setPanel}
        onSearchOpenChange={setIsSearchOpen}
      />

      <div className="relative flex items-center gap-4">
        {/* Desktop Search Input */}
        <SearchInput
          word={word}
          panel={panel}
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
          onPanelChange={setPanel}
        />

        {/* Notifications Bell */}
        <NotificationsBell
          reqs={reqs}
          isLoading={isLoading}
          panel={panel}
          onPanelChange={setPanel}
          onAcceptSession={(data) => mutationAcceptSession.mutate(data)}
          onRejectSession={(data) => mutationRejectSession.mutate(data)}
          onAddFriend={(data) => addFriend(data)}
          onDeleteRequest={(data) => mutationRequestDelete.mutate(data)}
        />

        {/* Avatar Menu */}
        <AvatarMenu
          panel={panel}
          onPanelChange={setPanel}
          onLogOut={() => mutation.mutate()}
        />

        {/* Navigation Menu */}
        <NavigationMenu
          panel={panel}
          onPanelChange={setPanel}
          onLogOut={() => mutation.mutate()}
        />
      </div>
    </div>
  );
};

export default Header;
