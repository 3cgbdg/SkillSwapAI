"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { addWantToLearnSkill, logOut } from "@/redux/authSlice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Found, FoundSkills, FoundUsers, IRequest } from "@/types/types";
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
import { toast } from "react-toastify";
import useFriends from "@/hooks/useFriends";

const Header = () => {
  const [panel, setPanel] = useState<
    "avatarMenu" | "search" | "notifs" | "navMenu" | null
  >(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [word, setWord] = useState<string>("");
  const [foundUsers, setFoundUsers] = useState<FoundUsers[]>([]);
  const [foundSkills, setFoundSkills] = useState<FoundSkills[]>([]);
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAppSelector((state) => state.auth);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const { addFriend, createFriendRequest } = useFriends();
  // log out
  const mutation = useMutation({
    mutationFn: async () => await AuthService.logOut(),
    onSuccess: () => {
      dispatch(logOut());
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
      toast.error(error.message);
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
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // adding skill (want to learn)
  const mutationAddLearn = useMutation({
    mutationFn: async (str: string) => SkillsService.addWantToLearnSkill(str),
    onError: (err) => {
      toast.error(err.message);
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
    onError: (err) => {
      toast.error(err.message);
    },
  });

  useEffect(() => {
    if (!user) return;
    const sock = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
      withCredentials: true,
    });
    setSocket(sock);
    return () => {
      sock.disconnect();
    };
  }, [user]);

  // connecting socket for tracking requests
  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {});
      socket.on("friendRequest", (payload) => {
        queryClient.setQueryData(["reqs"], (old: IRequest[]) => {
          return [...old, payload.request];
        });
      });
      socket.on("sessionCreationRequest", (payload) => {
        queryClient.setQueryData(["reqs"], (old: IRequest[]) => {
          return [...old, payload.request];
        });
      });
      socket.on("sessionAcceptedRequest", (payload) => {
        queryClient.setQueryData(["reqs"], (old: IRequest[]) => {
          return [...old, payload.request];
        });
      });
      socket.on("sessionRejectedRequest", (payload) => {
        queryClient.setQueryData(["reqs"], (old: IRequest[]) => {
          return [...old, payload.request];
        });
      });
      return () => {
        socket.off("friendRequest");
        socket.off("sessionCreationRequest");
        socket.off("sessionAcceptedRequest");
        socket.off("sessionRejectedRequest");
      };
    }
  }, [socket,queryClient]);

  return (
    <div className="flex items-center justify-between bg-white py-[14px] px-2 md:px-6 relative ">
      <div className="flex items-center gap-6 grow-1">
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
          dispatch(addWantToLearnSkill(skill));
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
            dispatch(addWantToLearnSkill(skill));
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
