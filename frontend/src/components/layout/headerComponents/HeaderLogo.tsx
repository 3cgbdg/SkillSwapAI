import Image from "next/image";
import Link from "next/link";

const HeaderLogo = () => {
  return (
    <Link
      href="/dashboard"
      className="group flex w-fit items-center gap-2 transition-colors"
    >
      <Image
        className="transition-transform group-hover:-rotate-45"
        width={32}
        height={32}
        src="/logo.png"
        alt="SkillSwap AI logo"
      />
      <span className="font-oswald relative text-2xl leading-none font-bold transition-colors group-hover:text-primary">
        <span className="text-primary">Skill</span>
        <span className="text-accent">Swap</span>
        AI
      </span>
    </Link>
  );
};

export default HeaderLogo;
