"use client";

import {
  Calendar,
  EllipsisVertical,
  MessageSquare,
  UserRound,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { DataEmpty } from "@/components/composites";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Link href="/inbox" className={cn(buttonVariants(), "w-fit md:hidden")}>
        Back to inbox
      </Link>
      <Card className="flex min-h-[calc(100dvh_-_var(--header-h)_-_var(--space-page)_*_2_-_3.25rem)] flex-1 flex-col overflow-hidden rounded-xl p-0 md:min-h-[calc(100dvh_-_var(--header-h)_-_var(--space-page)_*_2_-_4.5rem)]">
        <div className="border-border shrink-0 border-b">
          <div className="flex items-center justify-between gap-2 px-4 py-4 md:px-6">
            <div className="flex items-center gap-3">
              <HoverCard>
                <HoverCardTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                  <UserAvatar
                    name={currentChat?.friend.name}
                    imageUrl={currentChat?.friend.imageUrl}
                    size="md"
                  />
                </HoverCardTrigger>
                <HoverCardContent className="w-56">
                  <p className="font-semibold">{currentChat?.friend.name}</p>
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
                className="hover:bg-muted inline-flex size-8 items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
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
        </div>

        <div
          ref={containerRef}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6"
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
      </Card>
    </div>
  );
}
