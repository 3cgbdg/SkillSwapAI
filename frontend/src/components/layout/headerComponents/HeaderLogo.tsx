import Link from "next/link";

import { Logo } from "@/components/brand/Logo";

const HeaderLogo = () => {
  return (
    <Link
      href="/dashboard"
      className="group flex w-fit items-center gap-2 transition-colors"
    >
      {/* Rotating 180° swaps the teach and learn circles around the lens — the
          mark performs the exchange it stands for. */}
      <Logo
        size={32}
        className="transition-transform duration-[var(--duration-slow)] group-hover:rotate-180"
      />
      <span className="font-heading relative text-2xl leading-none font-bold transition-colors group-hover:text-primary">
        Skill<span className="text-primary">Swap</span>
      </span>
    </Link>
  );
};

export default HeaderLogo;
