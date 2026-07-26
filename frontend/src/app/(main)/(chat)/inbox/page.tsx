"use client";

import { ChatsEmptyLanding } from "@/components/chat/ChatsEmptyLanding";
import { InboxRequestsPanel } from "@/components/inbox/InboxRequestsPanel";
import { SegmentedControl } from "@/components/composites";
import { useRouter, useSearchParams } from "next/navigation";

export default function InboxPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("tab") === "requests" ? "requests" : "messages";

  const setTab = (value: string) => {
    if (value === "requests") {
      router.replace("/inbox?tab=requests");
    } else {
      router.replace("/inbox");
    }
  };

  return (
    <div className="flex min-h-[50dvh] flex-1 flex-col gap-4">
      <SegmentedControl
        aria-label="Inbox section"
        value={tab}
        onValueChange={setTab}
        options={[
          { value: "messages", label: "Messages" },
          { value: "requests", label: "Requests" },
        ]}
        className="max-w-md"
      />
      {tab === "requests" ? (
        <InboxRequestsPanel />
      ) : (
        <div className="hidden flex-1 items-center justify-center md:flex">
          <ChatsEmptyLanding />
        </div>
      )}
    </div>
  );
}
