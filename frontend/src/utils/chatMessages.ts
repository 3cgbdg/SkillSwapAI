import { format, isToday, isYesterday, isSameDay } from "date-fns";

import type { IMessage } from "@/types/types";

export type ChatMessageItem =
  | { type: "separator"; key: string; label: string }
  | {
      type: "group";
      key: string;
      fromId: string;
      isMine: boolean;
      messages: IMessage[];
      showTime: boolean;
    };

export function formatDaySeparator(date: Date): string {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMM d");
}

export function groupChatMessages(
  messages: IMessage[],
  myId: string | undefined
): ChatMessageItem[] {
  if (!messages.length) return [];

  const items: ChatMessageItem[] = [];
  let lastDay: Date | null = null;

  let buffer: IMessage[] = [];
  let bufferFrom: string | null = null;

  const flushBuffer = () => {
    if (!buffer.length || !bufferFrom) return;
    items.push({
      type: "group",
      key: buffer[0].id ?? `group-${buffer[0].createdAt}`,
      fromId: bufferFrom,
      isMine: bufferFrom === myId,
      messages: [...buffer],
      showTime: true,
    });
    buffer = [];
    bufferFrom = null;
  };

  for (const msg of messages) {
    const created = new Date(msg.createdAt);
    if (!lastDay || !isSameDay(lastDay, created)) {
      flushBuffer();
      lastDay = created;
      items.push({
        type: "separator",
        key: `sep-${format(created, "yyyy-MM-dd")}`,
        label: formatDaySeparator(created),
      });
    }

    if (bufferFrom && bufferFrom !== msg.fromId) {
      flushBuffer();
    }
    bufferFrom = msg.fromId;
    buffer.push(msg);
  }
  flushBuffer();

  return items;
}

export const TEMP_MESSAGE_PREFIX = "temp-";
