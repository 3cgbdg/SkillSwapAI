"use client";

import { format } from "date-fns";
import { AlertCircle, CheckCheck, RotateCcw } from "lucide-react";
import { useCallback } from "react";

import { ChatBubble } from "@/components/composites";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IMessage } from "@/types/types";
import type { ChatMessageItem } from "@/utils/chatMessages";

type ExtendedMessage = IMessage & { pending?: boolean; failed?: boolean };

function MessageBubble({
  msg,
  isMine,
  isLastInGroup,
  flatIdx,
  registerMessageRef,
  onRetry,
}: {
  msg: ExtendedMessage;
  isMine: boolean;
  isLastInGroup: boolean;
  flatIdx: number;
  registerMessageRef: (index: number, el: HTMLDivElement | null) => void;
  onRetry?: () => void;
}) {
  const messageRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (flatIdx >= 0) registerMessageRef(flatIdx, el);
    },
    [flatIdx, registerMessageRef]
  );

  return (
    <div
      ref={messageRef}
      className={cn("flex flex-col", isMine && "items-end")}
    >
      <ChatBubble isMine={isMine} failed={msg.failed} pending={msg.pending}>
        <p className="wrap-anywhere leading-5">{msg.content}</p>
        {isLastInGroup ? (
          <div
            className={cn(
              "mt-1 flex items-center justify-end gap-1.5 text-xs",
              isMine ? "text-primary-foreground/80" : "text-muted-foreground"
            )}
          >
            {msg.failed ? (
              <span className="text-destructive flex items-center gap-1">
                <AlertCircle className="size-3.5" />
                Failed
                {onRetry ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive size-6"
                    aria-label="Retry send"
                    onClick={onRetry}
                  >
                    <RotateCcw className="size-3.5" />
                  </Button>
                ) : null}
              </span>
            ) : null}
            <span>
              {format(new Date(msg.createdAt), "HH:mm")}
              {msg.pending ? " · Sending…" : ""}
            </span>
            {isMine && !msg.failed && !msg.pending ? (
              <CheckCheck
                className={cn(
                  "size-3.5",
                  msg.isSeen && "text-primary-foreground"
                )}
              />
            ) : null}
          </div>
        ) : null}
      </ChatBubble>
    </div>
  );
}

export function ChatMessageList({
  items,
  flatMessages,
  registerMessageRef,
  onRetryMessage,
}: {
  items: ChatMessageItem[];
  flatMessages: ExtendedMessage[];
  registerMessageRef: (index: number, el: HTMLDivElement | null) => void;
  onRetryMessage?: (msg: ExtendedMessage) => void;
}) {
  const flatIndexById = new Map(flatMessages.map((m, i) => [m.id, i] as const));

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => {
        if (item.type === "separator") {
          return (
            <div key={item.key} className="flex justify-center py-1">
              <Badge variant="status">{item.label}</Badge>
            </div>
          );
        }
        return (
          <div key={item.key} className="flex flex-col gap-1.5">
            {item.messages.map((msg, idx) => {
              const flatIdx = flatIndexById.get(msg.id) ?? -1;
              return (
                <MessageBubble
                  key={msg.id ?? idx}
                  msg={msg as ExtendedMessage}
                  isMine={item.isMine}
                  isLastInGroup={idx === item.messages.length - 1}
                  flatIdx={flatIdx}
                  registerMessageRef={registerMessageRef}
                  onRetry={
                    (msg as ExtendedMessage).failed && onRetryMessage
                      ? () => onRetryMessage(msg as ExtendedMessage)
                      : undefined
                  }
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
