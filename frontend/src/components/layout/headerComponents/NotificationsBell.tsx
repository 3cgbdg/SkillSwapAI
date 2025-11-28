import { Bell } from "lucide-react";
import { motion } from "framer-motion";
import { IRequest } from "@/types/types";
import NotificationsList from "./NotificationsList";
import Spinner from "@/components/Spinner";
import { Dispatch, SetStateAction } from "react";

interface NotificationsBellProps {
  reqs: IRequest[] | undefined;
  panel: string | null;
  onPanelChange: Dispatch<
    SetStateAction<"avatarMenu" | "search" | "notifs" | "navMenu" | null>
  >;
  onAcceptSession: ({
    sessionId,
    requestId,
    friendId,
  }: {
    sessionId: string;
    requestId: string;
    friendId: string;
  }) => void;
  onRejectSession: ({
    sessionId,
    requestId,
    friendId,
  }: {
    sessionId: string;
    requestId: string;
    friendId: string;
  }) => void;
  onAddFriend: ({ fromId, id }: { fromId: string; id: string }) => void;
  onDeleteRequest: ({ requestId }: { requestId: string }) => void;
  isLoading: boolean;
}

const NotificationsBell = ({
  reqs,
  panel,
  onPanelChange,
  onAcceptSession,
  onRejectSession,
  onAddFriend,
  onDeleteRequest,
  isLoading,
}: NotificationsBellProps) => {
  return (
    <div className="relative">
      <motion.button
        onClick={() => onPanelChange(panel !== "notifs" ? "notifs" : null)}
        className="hover:text-blue relative transition-colors cursor-pointer"
        whileHover={{ rotate: [0, 15, -10, 5, -5, 0] }}
        transition={{ duration: 0.5 }}
        animate={{ rotate: 0 }}
      >
        <Bell size={32} />
        <span className="rounded-full p-1 px-2 text-white font-semibold text-xs bg-blue absolute -top-2 -right-2">
          {reqs?.length || 0}
        </span>
      </motion.button>

      {/* notifs list */}
      {panel == "notifs" && (
        <div className="">
          <div className="_border panel mt-2 rounded-md p-3 absolute z-10 top-full bg-white right-0 min-w-[250px] flex flex-col gap-2">
            {!isLoading ? (
              reqs && reqs.length > 0 ? (
                <NotificationsList
                  reqs={reqs}
                  onAcceptSession={onAcceptSession}
                  onRejectSession={onRejectSession}
                  onAddFriend={onAddFriend}
                  onDeleteRequest={onDeleteRequest}
                />
              ) : (
                <span className="text-sm leading-5">No notifications</span>
              )
            ) : (
              <Spinner size={24} color="blue" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
