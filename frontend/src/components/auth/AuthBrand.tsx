"use client";

import Image from "next/image";

export function AuthBrand() {
  return (
    <div className="mb-1 flex flex-col items-center gap-4">
      <Image src="/logo.png" height={44} width={44} alt="SkillSwap AI Logo" />
      <div className="text-center">
        <h1 className="font-oswald text-2xl leading-8 font-bold">
          <span className="text-primary">Skill</span>
          <span className="text-accent">Swap</span>
          <span className="text-foreground">AI</span>
        </h1>
      </div>
    </div>
  );
}
