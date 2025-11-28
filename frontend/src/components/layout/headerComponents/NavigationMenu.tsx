import { Hamburger } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/constants/navLinks";
import { Dispatch, SetStateAction } from "react";

interface NavigationMenuProps {
  panel: string | null;
  onPanelChange: Dispatch<SetStateAction<"avatarMenu" | "search" | "notifs" | "navMenu" | null>>;
  onLogOut: () => void;
}

const NavigationMenu = ({
  panel,
  onPanelChange,
  onLogOut,
}: NavigationMenuProps) => {
  const path = usePathname();

  return (
    <>
      <div className="md:hidden">
        <button
          className={`cursor-pointer transition-all hover:text-primary ${panel === "navMenu" ? "text-primary" : ""}`}
          onClick={() => {
            onPanelChange(panel === "navMenu" ? null : "navMenu");
          }}
        >
          <Hamburger className="" size={30} />
        </button>
      </div>
      {panel === "navMenu" && (
        <div className="w-full flex bg-white z-50  flex-col top-full panel  right-0 absolute  _border min-w-[250px]    p-3  ">
          <nav className="flex flex-col   ">
            {navLinks.map((item) => (
              <Link
                key={item.link}
                href={item.link}
                className={`p-2   flex items-center gap-2 text-sm leading-5.5 font-medium text-neutral-600 rounded-lg  ${item.link === path ? "text-neutral-900 font-semibold bg-blue-300" : " "} `}
              >
                {item.icon} {item.title}
              </Link>
            ))}
            <div className="flex flex-col gap-4 items-start border-t-1 mt-1 pt-1">
              <button className="link" onClick={() => onLogOut()}>
                Log out
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default NavigationMenu;
