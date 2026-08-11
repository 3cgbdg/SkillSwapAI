import { UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "size-10",
  md: "size-12",
  lg: "size-16",
  xl: "size-24",
} as const;

export function UserAvatar({
  name,
  imageUrl,
  size = "md",
  className,
}: {
  name?: string;
  imageUrl?: string | null;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  const initials = name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {imageUrl ? (
        <AvatarImage
          src={imageUrl}
          alt={name ? `${name} avatar` : "User avatar"}
        />
      ) : null}
      <AvatarFallback>
        {initials ?? <UserRound className="size-5" aria-hidden />}
      </AvatarFallback>
    </Avatar>
  );
}
