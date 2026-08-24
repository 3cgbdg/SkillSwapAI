"use client";

import {
  Calendar,
  EllipsisVertical,
  MessageSquare,
  UserRound,
  Video,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { DataEmpty } from "@/components/composites";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Spinner } from "@/components/ui/spinner";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";
import type { IChat } from "@/types/types";
import type { ChatMessageItem } from "@/utils/chatMessages";
import { showErrorToast } from "@/utils/toast";
import type { ReactNode } from "react";

type ExtendedMessage = import("@/types/types").IMessage & {
  pending?: boolean;
  failed?: boolean;
};

export function ChatThread({
  currentChat,
  isTyping,
  isOnline,
  isLoading,
  grouped,
  flatMessages,
  registerMessageRef,
  onRetryMessage,
  containerRef,
  endRef,
  footer,
}: {
  currentChat: IChat | null;
  isTyping: boolean;
  isOnline: boolean;
  isLoading: boolean;
  grouped: ChatMessageItem[];
  flatMessages: ExtendedMessage[];
  registerMessageRef: (index: number, el: HTMLDivElement | null) => void;
  onRetryMessage?: (msg: ExtendedMessage) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  endRef: React.RefObject<HTMLDivElement | null>;
  footer?: ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Link href="/inbox" className={cn(buttonVariants(), "w-fit md:hidden")}>
        Back to inbox
      </Link>
      <Card className="flex min-h-[var(--chat-panel-min-h)] flex-1 flex-col rounded-none border-0 p-0 shadow-none md:min-h-[var(--chat-panel-min-h-md)]">
        <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="flex min-h-0 flex-col">
            <CardHeader bordered className="shrink-0 p-0">
              <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
                <div className="flex items-center gap-4">
                  <HoverCard>
                    <HoverCardTrigger
                      href={
                        currentChat
                          ? `/profiles/${currentChat.friend.id}`
                          : undefined
                      }
                      className="outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      <UserAvatar
                        name={currentChat?.friend.name}
                        imageUrl={currentChat?.friend.imageUrl}
                        size="md"
                      />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-56">
                      <p className="font-semibold">
                        {currentChat?.friend.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {isOnline ? "Online now" : "Offline"}
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                  <div>
                    <p className="font-heading font-semibold">
                      {currentChat?.friend.name}
                    </p>
                    <span
                      className={cn(
                        "block text-sm",
                        isOnline ? "text-success" : "text-muted-foreground"
                      )}
                    >
                      {isTyping ? "Typing…" : isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={buttonVariants({
                      variant: "ghost",
                      size: "icon",
                    })}
                    aria-label="Chat options"
                  >
                    <EllipsisVertical className="size-5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        currentChat?.friend.id &&
                        router.push(`/profiles/${currentChat.friend.id}`)
                      }
                    >
                      <UserRound className="size-4" />
                      View profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          `/schedule?schedule=true&name=${encodeURIComponent(currentChat?.friend.name || "")}`
                        )
                      }
                    >
                      <Calendar className="size-4" />
                      Schedule session
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => showErrorToast("Mute coming soon")}
                    >
                      <VolumeX className="size-4" />
                      Mute
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <div
              ref={containerRef}
              className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-muted/20 p-4 md:p-6"
            >
              {!isLoading ? (
                flatMessages.length > 0 ? (
                  <ChatMessageList
                    items={grouped}
                    flatMessages={flatMessages}
                    registerMessageRef={registerMessageRef}
                    onRetryMessage={onRetryMessage}
                  />
                ) : (
                  <DataEmpty
                    icon={MessageSquare}
                    title="Start the conversation"
                    description="Send a message to begin chatting."
                    className="mt-12 border-none bg-transparent"
                  />
                )
              ) : (
                <div className="flex flex-1 items-center justify-center">
                  <Spinner size="xl" />
                </div>
              )}
              <div ref={endRef} />
            </div>
            {footer}
          </div>
          <aside className="hidden border-l p-5 md:block">
            <div className="flex flex-col items-center text-center">
              <UserAvatar
                name={currentChat?.friend.name}
                imageUrl={currentChat?.friend.imageUrl}
                size="xl"
              />
              <h2 className="mt-3 font-heading text-lg font-bold">
                {currentChat?.friend.name}
              </h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Skill exchange partner
              </p>
              <span
                className={cn(
                  "mt-3 flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                  isOnline
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "size-2 rounded-full",
                    isOnline ? "bg-success" : "bg-muted-foreground"
                  )}
                />
                {isOnline ? "Online now" : "Currently offline"}
              </span>
            </div>
            <div className="mt-6 rounded-xl bg-muted/60 p-4">
              <p className="text-primary text-xs font-bold uppercase tracking-wider">
                Keep learning moving
              </p>
              <p className="mt-2 text-sm font-semibold">
                Plan your next focused exchange
              </p>
              <p className="text-muted-foreground mt-1 text-xs leading-5">
                Turn this conversation into a scheduled learning session.
              </p>
            </div>
            <div className="mt-4 grid gap-2">
              <Link
                href={`/schedule?schedule=true&name=${encodeURIComponent(currentChat?.friend.name || "")}`}
                className={buttonVariants()}
              >
                <Video className="size-4" />
                Schedule session
              </Link>
              {currentChat?.friend.id ? (
                <Link
                  href={`/profiles/${currentChat.friend.id}`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  <UserRound className="size-4" />
                  View profile
                </Link>
              ) : null}
            </div>
          </aside>
        </div>
      </Card>
    </div>
  );
}
