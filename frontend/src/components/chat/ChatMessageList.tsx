"use client";

import { format } from "date-fns";
import { AlertCircle, CheckCheck, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IMessage } from "@/types/types";
import type { ChatMessageItem } from "@/utils/chatMessages";

type ExtendedMessage = IMessage & { pending?: boolean; failed?: boolean };

function MessageBubble({
  msg,
  isMine,
  isLastInGroup,
  messageRef,
  onRetry,
}: {
  msg: ExtendedMessage;
  isMine: boolean;
  isLastInGroup: boolean;
  messageRef?: (el: HTMLDivElement | null) => void;
  onRetry?: () => void;
}) {
  return (
    <div
      ref={messageRef}
      className={cn("flex flex-col", isMine && "items-end")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
          isMine
            ? "bg-primary text-primary-foreground"
            : "bg-surface-raised text-foreground border border-border",
          msg.failed && "ring-2 ring-destructive/50",
          msg.pending && "opacity-80"
        )}
      >
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
      </div>
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
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        if (item.type === "separator") {
          return (
            <div
              key={item.key}
              className="text-muted-foreground flex justify-center py-1 text-xs font-medium"
            >
              <span className="bg-muted/60 rounded-full px-3 py-1">
                {item.label}
              </span>
            </div>
          );
        }
        return (
          <div key={item.key} className="flex flex-col gap-1">
            {item.messages.map((msg, idx) => {
              const flatIdx = flatIndexById.get(msg.id) ?? -1;
              return (
                <MessageBubble
                  key={msg.id ?? idx}
                  msg={msg as ExtendedMessage}
                  isMine={item.isMine}
                  isLastInGroup={idx === item.messages.length - 1}
                  messageRef={
                    flatIdx >= 0
                      ? (el) => registerMessageRef(flatIdx, el)
                      : undefined
                  }
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
