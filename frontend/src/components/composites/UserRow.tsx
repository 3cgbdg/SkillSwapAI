import type { ReactNode } from "react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";

export function UserRow({
  media,
  title,
  description,
  actions,
  className,
  onClick,
}: {
  media: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Item
      className={cn(onClick && "cursor-pointer", className)}
      onClick={onClick}
      variant="outline"
    >
      <ItemMedia variant="image">{media}</ItemMedia>
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        {description ? <ItemDescription>{description}</ItemDescription> : null}
      </ItemContent>
      {actions ? <ItemActions>{actions}</ItemActions> : null}
    </Item>
  );
}
