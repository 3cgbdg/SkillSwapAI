import Image from "next/image";
import Link from "next/link";

const HeaderLogo = () => {
  return (
    <Link
      href={"/dashboard"}
      className="flex items-center group  gap-2 w-fit text-green"
    >
      <Image
        className="stroke-darkBlue transition-transform group-hover:-rotate-45"
        width={32}
        height={32}
        src="/logo.png"
        alt="logo"
      />
      <span className="transiiton-colors relative  group-hover:text-violet  font-oswald text-2xl leading-none font-bold">
        <span className="text-cyan-300">Skill</span>
        <span className="text-yellow-300">Swap</span>
        AI
      </span>
    </Link>
  );
};

export default HeaderLogo;
