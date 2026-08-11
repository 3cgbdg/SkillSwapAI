"use client";

import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/ui/user-avatar";
import useProfile from "@/hooks/useProfile";

interface AvatarMenuProps {
  onLogOut: () => void;
}

const AvatarMenu = ({ onLogOut }: AvatarMenuProps) => {
  const { data: user } = useProfile();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="hidden rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:inline-flex"
        aria-label="Open profile menu"
      >
        <UserAvatar name={user?.name} imageUrl={user?.imageUrl} size="md" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            {user?.name ? user.name : "Profile"}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="p-0">
          <Link href="/profile" className="flex w-full px-1.5 py-1">
            My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onLogOut}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AvatarMenu;
