import { Check, X } from "lucide-react";
import { IRequest } from "@/types/session";
import { formatSessionDay, formatSessionTimeRange } from "@/utils/sessionTime";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserRow } from "@/components/composites";
import { UserAvatar } from "@/components/ui/user-avatar";

interface NotificationsListProps {
  reqs: IRequest[];
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
}

const NotificationsList = ({
  reqs,
  onAcceptSession,
  onRejectSession,
  onAddFriend,
  onDeleteRequest,
}: NotificationsListProps) => {
  return (
    <div className="flex w-full flex-col gap-2 pb-4 not-last:border-b border-border">
      <h3 className="text-lg font-medium leading-7">Latest requests</h3>
      <div className="flex max-h-[450px] flex-col gap-1 overflow-x-auto">
        {reqs?.map((req) => {
          return req.type == "FRIEND" ? (
            <Card key={req.id} className="p-2">
              <CardContent className="p-0">
                <UserRow
                  media={
                    <UserAvatar
                      name={req.from.name}
                      imageUrl={
                        "imageUrl" in req.from
                          ? (req.from as { imageUrl?: string }).imageUrl
                          : undefined
                      }
                      size="sm"
                    />
                  }
                  title={req.from.name}
                  description="Friend request"
                  actions={
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Accept friend request"
                        onClick={() =>
                          onAddFriend({ fromId: req.fromId, id: req.id })
                        }
                      >
                        <Check size={16} />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Decline friend request"
                        onClick={() => onDeleteRequest({ requestId: req.id })}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  }
                />
              </CardContent>
            </Card>
          ) : req.type == "SESSIONCREATED" ? (
            <Card key={req.id} className="p-2">
              <CardContent className="flex flex-col gap-2 p-0">
                <h2 className="text-lg font-semibold leading-7">
                  Session Request 🗓️
                </h2>
                <p>
                  <span className="font-semibold">From:</span> {req.from.name}
                </p>
                {req.session.startsAt && req.session.endsAt ? (
                  <div className="mb-4 flex flex-col">
                    <p className="font-medium">
                      <span className="font-semibold">When:</span>{" "}
                      {formatSessionDay(req.session.startsAt)}{" "}
                      {formatSessionTimeRange(
                        req.session.startsAt,
                        req.session.endsAt
                      )}
                    </p>
                  </div>
                ) : null}
                <div className="grid grid-cols-2 items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Accept session request"
                    onClick={() =>
                      onAcceptSession({
                        sessionId: req.sessionId,
                        requestId: req.id,
                        friendId: req.fromId,
                      })
                    }
                  >
                    <Check size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Decline session request"
                    onClick={() =>
                      onRejectSession({
                        sessionId: req.sessionId,
                        requestId: req.id,
                        friendId: req.fromId,
                      })
                    }
                  >
                    <X size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : req.type == "SESSIONACCEPTED" ? (
            <div key={req.id} className="flex flex-col">
              <h2 className="text-lg font-semibold leading-7">
                Session Request 🗓️
              </h2>
              <span className="font-semibold">From:</span> {req.from.name}
              {req.session.title && (
                <div className="mb-4 flex flex-col">
                  <p className="font-medium">
                    <span className="font-semibold">Accepted</span> session:
                    &quot;{req.session.title}&quot;
                  </p>
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => onDeleteRequest({ requestId: req.id })}
              >
                OK
              </Button>
            </div>
          ) : (
            <div key={req.id} className="flex flex-col">
              <h2 className="text-lg font-semibold leading-7">
                Session Request 🗓️
              </h2>
              <span className="font-semibold">From:</span> {req.from.name}
              {req.session.title && (
                <div className="mb-4 flex flex-col">
                  <p className="font-medium">
                    <span className="font-semibold">Rejected</span> session:
                    &quot;{req.session.title}&quot;
                  </p>
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => onDeleteRequest({ requestId: req.id })}
              >
                OK
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationsList;
