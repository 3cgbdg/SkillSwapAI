import { UserRound, X } from "lucide-react";
import Image from "next/image";
import useProfile from "@/hooks/useProfile";
import { Dispatch, SetStateAction } from "react";

interface AvatarMenuProps {
  panel: string | null;
  onPanelChange: Dispatch<
    SetStateAction<"avatarMenu" | "search" | "notifs" | "navMenu" | null>
  >;
  onLogOut: () => void;
}

const AvatarMenu = ({ panel, onPanelChange, onLogOut }: AvatarMenuProps) => {
  const { data: user } = useProfile();

  return (
    <div className="hidden md:block">
      <button
        onClick={() =>
          onPanelChange(panel !== "avatarMenu" ? "avatarMenu" : null)
        }
        className={` cursor-pointer  hover:text-violet hover:border-violet ${panel === "avatarMenu" ? "text-violet border-violet" : ""} transition-colors rounded-full overflow-hidden _border flex items-center justify-center size-12`}
      >
        {panel !== "avatarMenu" ? (
          !user?.imageUrl ? (
            <UserRound size={24} />
          ) : (
            <div className="w-[48px] relative h-[48px] rounded-full overflow-hidden">
              <Image
                className="object-cover"
                src={user.imageUrl}
                fill
                alt="user image"
              />
            </div>
          )
        ) : (
          <X />
        )}
      </button>
      {panel == "avatarMenu" && (
        <div className=" absolute min-w-[250px] right-0 top-[140%] panel z-10">
          <div className="_border  rounded-lg p-5 bg-white">
            <h3 className="font-semibold pb-1 border-b mb-2">Profile</h3>
            <div className="flex flex-col gap-4 items-start">
              <button className="link" onClick={() => onLogOut()}>
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarMenu;
