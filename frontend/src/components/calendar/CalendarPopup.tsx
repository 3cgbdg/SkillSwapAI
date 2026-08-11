"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { AxiosError } from "axios";

import type { CalendarPopupPrefill } from "@/components/calendar/Calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useSocket } from "@/context/SocketContext";
import useFriends from "@/hooks/useFriends";
import SessionsService from "@/services/SessionsService";
import {
  SESSION_COLOR_KEYS,
  SESSION_COLOR_STYLES,
  resolveSessionColor,
} from "@/utils/sessionColors";
import { showSuccessToast } from "@/utils/toast";
import {
  createSessionFormData,
  createSessionSchema,
} from "@/validation/createSession";
import type { SessionColorKey } from "@/types/session";
import { cn } from "@/lib/utils";

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}

const DURATION_PRESETS = [
  { label: "30 min", minutes: 30 },
  { label: "1 hr", minutes: 60 },
  { label: "1.5 hr", minutes: 90 },
] as const;

const CalendarPopup = ({
  weekAnchor,
  prefill,
  setAddSessionPopup,
  otherName,
  onClose,
}: {
  otherName: string | null;
  weekAnchor: Date;
  prefill: CalendarPopupPrefill;
  setAddSessionPopup: Dispatch<SetStateAction<boolean>>;
  onClose?: () => void;
}) => {
  const defaultTz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );
  const defaultStart = useMemo(() => {
    if (prefill?.startsAt) return new Date(prefill.startsAt);
    const d = new Date(weekAnchor);
    d.setHours(10, 0, 0, 0);
    return d;
  }, [prefill?.startsAt, weekAnchor]);
  const defaultEnd = useMemo(() => {
    if (prefill?.endsAt) return new Date(prefill.endsAt);
    const d = new Date(defaultStart);
    d.setHours(d.getHours() + 1);
    return d;
  }, [prefill?.endsAt, defaultStart]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<createSessionFormData>({
    resolver: zodResolver(createSessionSchema) as never,
    defaultValues: {
      friendName: otherName ?? "",
      friendId: "",
      title: "",
      startsAt: defaultStart.toISOString(),
      endsAt: defaultEnd.toISOString(),
      timeZone: defaultTz,
      color: "plum",
    },
  });

  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [chars, setChars] = useState<string>("");
  const [addFriendButton, setAddFriendButton] = useState<boolean>(false);
  const { friends, isFetching, createFriendRequest, refetch } = useFriends();
  const [badRequestErrorMessage, setBadRequestErrorMessage] = useState<
    string | null
  >(null);

  const startsAtIso = watch("startsAt");
  const endsAtIso = watch("endsAt");
  const selectedColor = watch("color") as SessionColorKey;

  const createSessionMutation = useMutation({
    mutationKey: ["session"],
    mutationFn: async (data: Omit<createSessionFormData, "friendName">) =>
      SessionsService.createSession(data),
    onSuccess: (data) => {
      showSuccessToast(data.message || "Session created");
      setAddSessionPopup(false);
      onClose?.();

      if (socket?.connected)
        socket.emit("createSessionRequest", { id: data.session.id });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<{ message: string }>;
      setBadRequestErrorMessage(err.response?.data?.message || err.message);
    },
  });

  const createSession: SubmitHandler<createSessionFormData> = async (data) => {
    const { friendName, ...newData } = data;
    if (friends) {
      const realFriend = friends.find((item) => item.name === friendName);
      if (realFriend) {
        createSessionMutation.mutate({
          ...newData,
          friendId: realFriend.id,
        });
      } else {
        setBadRequestErrorMessage(
          "There`s no such friend in your list. Firstly add Friend!"
        );
        setAddFriendButton(true);
      }
    }
  };

  useEffect(() => {
    if (otherName) {
      setValue("friendName", otherName);
      refetch();
    }
  }, [otherName, setValue, refetch]);

  useEffect(() => {
    setValue("startsAt", defaultStart.toISOString());
    setValue("endsAt", defaultEnd.toISOString());
  }, [defaultStart, defaultEnd, setValue]);

  const applyDuration = (minutes: number) => {
    const start = new Date(startsAtIso || defaultStart.toISOString());
    const end = new Date(start.getTime() + minutes * 60_000);
    setValue("endsAt", end.toISOString());
  };

  const close = () => {
    setAddSessionPopup(false);
    onClose?.();
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent className="max-w-[500px] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-h3">
            Create a new session
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(createSession)}
          className="flex w-full flex-col gap-4 px-1"
        >
          <div className="flex flex-col gap-1">
            <Label htmlFor="title">Title</Label>
            <Input
              {...register("title")}
              placeholder="Enter title"
              type="text"
              id="title"
            />
            {errors.title ? (
              <span className="font-medium text-destructive">
                {errors.title.message}
              </span>
            ) : null}
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="description">
              Description{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              maxLength={50}
              {...register("description")}
              className="min-h-10"
              placeholder="Enter description"
              id="description"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="meetingLink">
              Meeting link{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              {...register("meetingLink")}
              placeholder="https://"
              type="url"
              id="meetingLink"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="startsAtLocal">Starts</Label>
              <Input
                id="startsAtLocal"
                type="datetime-local"
                value={toDatetimeLocalValue(
                  new Date(startsAtIso || defaultStart)
                )}
                onChange={(e) =>
                  setValue("startsAt", fromDatetimeLocalValue(e.target.value))
                }
              />
              {errors.startsAt ? (
                <span className="font-medium text-destructive">
                  {errors.startsAt.message}
                </span>
              ) : null}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="endsAtLocal">Ends</Label>
              <Input
                id="endsAtLocal"
                type="datetime-local"
                value={toDatetimeLocalValue(new Date(endsAtIso || defaultEnd))}
                onChange={(e) =>
                  setValue("endsAt", fromDatetimeLocalValue(e.target.value))
                }
              />
              {errors.endsAt ? (
                <span className="font-medium text-destructive">
                  {errors.endsAt.message}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-xs">Duration</span>
            {DURATION_PRESETS.map((preset) => (
              <Button
                key={preset.minutes}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyDuration(preset.minutes)}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="timeZone">Timezone</Label>
            <Input {...register("timeZone")} id="timeZone" readOnly />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {SESSION_COLOR_KEYS.map((key) => {
                const style = resolveSessionColor(key);
                return (
                  <button
                    key={key}
                    type="button"
                    className={cn(
                      "h-8 w-8 rounded-full border-2 border-transparent ring-offset-background transition",
                      selectedColor === key &&
                        "border-primary ring-2 ring-primary"
                    )}
                    style={{
                      backgroundColor: SESSION_COLOR_STYLES[key].bg,
                      color: style.color,
                    }}
                    aria-label={`Color ${key}`}
                    onClick={() => setValue("color", key)}
                  />
                );
              })}
            </div>
          </div>

          <input type="hidden" {...register("startsAt")} />
          <input type="hidden" {...register("endsAt")} />
          <input type="hidden" {...register("timeZone")} />
          <input type="hidden" {...register("color")} />

          <div className="relative flex flex-col gap-1">
            <Label htmlFor="friendName">Partner</Label>
            <Input
              type="text"
              placeholder="Find by name"
              id="friendName"
              {...register("friendName")}
              onChange={async (e) => {
                setChars(e.target.value);
                if (e.target.value.length === 1 && !friends) {
                  await refetch();
                }
              }}
            />
            {!isFetching ? (
              friends &&
              chars.length > 0 && (
                <div className="absolute top-full left-0 z-50 max-h-[300px] min-w-[250px] overflow-y-auto">
                  <Card className="mt-2 gap-1 p-2">
                    <div className="flex max-h-[500px] flex-col gap-1">
                      {friends
                        .filter((friend) =>
                          (friend.name || "")
                            .toLowerCase()
                            .includes(chars.toLocaleLowerCase())
                        )
                        .map((friend) => (
                          <Button
                            type="button"
                            key={friend.id}
                            variant="ghost"
                            className="justify-start"
                            onClick={() => {
                              setValue("friendName", friend.name || "");
                              setChars("");
                            }}
                          >
                            {friend.name}
                          </Button>
                        ))}
                    </div>
                  </Card>
                </div>
              )
            ) : (
              <Spinner size="md" />
            )}
            {errors.friendName ? (
              <span className="font-medium text-destructive">
                {errors.friendName.message}
              </span>
            ) : null}
          </div>
          {badRequestErrorMessage ? (
            <span className="font-medium text-destructive">
              {badRequestErrorMessage}
            </span>
          ) : null}
          <div className="flex w-full items-center gap-4">
            <Button type="submit" className="w-full">
              Create
            </Button>
            {addFriendButton && otherName ? (
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={() => createFriendRequest({ name: otherName })}
              >
                Add friend <Users size={16} />
              </Button>
            ) : null}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarPopup;
