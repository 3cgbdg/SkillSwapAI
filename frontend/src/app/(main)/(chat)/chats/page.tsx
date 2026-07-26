"use client";

import { ChatsEmptyLanding } from "@/components/chat/ChatsEmptyLanding";

const Page = () => {
  return (
    <div className="hidden min-h-[50dvh] flex-1 items-center justify-center md:flex">
      <ChatsEmptyLanding />
    </div>
  );
};

export default Page;
