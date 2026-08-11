"use client";

import { Bell } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import NotificationsList from "./NotificationsList";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { IRequest } from "@/types/session";

interface NotificationsBellProps {
  reqs: IRequest[] | undefined;
  onAcceptSession: (data: {
    sessionId: string;
    requestId: string;
    friendId: string;
  }) => void;
  onRejectSession: (data: {
    sessionId: string;
    requestId: string;
    friendId: string;
  }) => void;
  onAddFriend: (data: { fromId: string; id: string }) => void;
  onDeleteRequest: (data: { requestId: string }) => void;
  isLoading: boolean;
}

const NotificationsBell = ({
  reqs,
  onAcceptSession,
  onRejectSession,
  onAddFriend,
  onDeleteRequest,
  isLoading,
}: NotificationsBellProps) => {
  const reduceMotion = useReducedMotion();
  const count = reqs?.length ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="text-foreground hover:text-primary relative rounded-md p-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label="Notifications"
      >
        <motion.span
          whileHover={
            reduceMotion ? undefined : { rotate: [0, 15, -10, 5, -5, 0] }
          }
          transition={{ duration: 0.5 }}
          className="inline-flex"
        >
          <Bell size={28} />
        </motion.span>
        {count > 0 ? (
          <Badge className="absolute -top-1 -right-1 min-w-5 justify-center px-1">
            {count}
          </Badge>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[280px] p-3">
        {isLoading ? (
          <Spinner size="md" className="mx-auto" />
        ) : reqs && reqs.length > 0 ? (
          <NotificationsList
            reqs={reqs}
            onAcceptSession={onAcceptSession}
            onRejectSession={onRejectSession}
            onAddFriend={onAddFriend}
            onDeleteRequest={onDeleteRequest}
          />
        ) : (
          <p className="text-muted-foreground text-sm">No notifications</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsBell;
