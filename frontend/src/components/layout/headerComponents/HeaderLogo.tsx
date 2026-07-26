import Link from "next/link";

import { Logo } from "@/components/brand/Logo";

const HeaderLogo = () => {
  return (
    <Link
      href="/dashboard"
      className="group flex w-fit items-center gap-2 transition-colors"
    >
      <Logo
        size={32}
        className="transition-transform duration-[var(--duration-base)] group-hover:-rotate-45"
      />
      <span className="font-heading relative text-2xl leading-none font-bold transition-colors group-hover:text-primary">
        <span className="text-primary">Skill</span>
        <span className="text-brand-accent">Swap</span>
        AI
      </span>
    </Link>
  );
};

export default HeaderLogo;
