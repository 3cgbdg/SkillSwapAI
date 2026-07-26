"use client";

import { format } from "date-fns";
import { AlertCircle, CheckCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import type { IMessage } from "@/types/types";
import type { ChatMessageItem } from "@/utils/chatMessages";

function MessageBubble({
  msg,
  isMine,
  isLastInGroup,
}: {
  msg: IMessage & { pending?: boolean; failed?: boolean };
  isMine: boolean;
  isLastInGroup: boolean;
}) {
  return (
    <div
      className={cn(
        "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
        isMine
          ? "ml-auto bg-primary text-primary-foreground"
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
  );
}

export function ChatMessageList({ items }: { items: ChatMessageItem[] }) {
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
            {item.messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id ?? idx}
                msg={msg}
                isMine={item.isMine}
                isLastInGroup={idx === item.messages.length - 1}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
