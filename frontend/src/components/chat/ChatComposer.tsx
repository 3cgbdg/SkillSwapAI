"use client";

import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function ChatComposer({
  value,
  onChange,
  onSend,
  onTyping,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onTyping: () => void;
}) {
  return (
    <CardFooter className="bg-card shrink-0 p-0">
      <div className="flex w-full items-end gap-4 p-4 md:px-6">
        <Textarea
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          onChange={(e) => {
            onChange(e.target.value);
            onTyping();
          }}
          value={value}
          className="min-h-10 w-full resize-none text-sm"
          placeholder="Type your message…"
          rows={1}
        />
        <Button
          type="button"
          size="icon"
          className="size-10 shrink-0"
          onClick={onSend}
          aria-label="Send message"
        >
          <Send size={16} />
        </Button>
      </div>
    </CardFooter>
  );
}
