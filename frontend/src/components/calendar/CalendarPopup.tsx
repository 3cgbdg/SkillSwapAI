"use client";
import { formatDate } from "@/app/utils/calendar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useSocket } from "@/context/SocketContext";
import useFriends from "@/hooks/useFriends";
import SessionsService from "@/services/SessionsService";
import { createSessionFormData } from "@/validation/createSession";
import { showSuccessToast } from "@/utils/toast";
import { Spinner } from "@/components/ui/spinner";
import { AxiosError } from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

const CalendarPopup = ({
  year,
  month,
  setAddSessionPopup,
  otherName,
}: {
  otherName: string | null;
  year: number;
  month: number;
  setAddSessionPopup: Dispatch<SetStateAction<boolean>>;
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<createSessionFormData>();
  const queryClient = useQueryClient();
  const firstDay = new Date(year, month, 1);
  const { socket } = useSocket();
  const [chars, setChars] = useState<string>("");
  const [addFriendButton, setAddFriendButton] = useState<boolean>(false);
  const { friends, isFetching, createFriendRequest, refetch } = useFriends();
  const [badRequestErrorMessage, setBadRequestErrorMessage] = useState<
    string | null
  >(null);

  const createSessionMutation = useMutation({
    mutationKey: ["session"],
    mutationFn: async (data: Omit<createSessionFormData, "friendName">) =>
      SessionsService.createSession(data),
    onSuccess: (data) => {
      showSuccessToast(data.message || "Session created");
      setAddSessionPopup(false);

      if (socket?.connected)
        socket.emit("createSessionRequest", { id: data.session.id });
      queryClient.invalidateQueries({ queryKey: ["sessions", month] });
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
        newData.friendId = realFriend.id;
        createSessionMutation.mutate(newData);
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

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) setAddSessionPopup(false);
      }}
    >
      <DialogContent className="max-w-[500px] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg leading-7 font-semibold">
            Create a new Session
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
            {errors.title && (
              <span
                data-testid="error"
                className="font-medium text-destructive"
              >
                {errors.title.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="description">
              Description{" "}
              <span className="text-muted-foreground">(Optional)</span>
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
              Meeting Link{" "}
              <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              {...register("meetingLink")}
              placeholder="Enter meeting link"
              type="text"
              id="meetingLink"
            />
          </div>
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-1 flex-col gap-1">
              <Label htmlFor="start">Start Hour</Label>
              <Input
                {...register("start")}
                placeholder="Enter start hour"
                type="text"
                id="start"
              />
              {errors.start && (
                <span
                  data-testid="error"
                  className="font-medium text-destructive"
                >
                  {errors.start.message}
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <Label htmlFor="end">End Hour</Label>
              <Input
                {...register("end")}
                placeholder="Enter end hour"
                type="text"
                id="end"
              />
              {errors.end && (
                <span
                  data-testid="error"
                  className="font-medium text-destructive"
                >
                  {errors.end.message}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="date">Date</Label>
            <Input
              min={formatDate(firstDay)}
              {...register("date", { required: "Field is required" })}
              type="date"
              id="date"
            />
            {errors.date && (
              <span
                data-testid="error"
                className="font-medium text-destructive"
              >
                {errors.date.message}
              </span>
            )}
          </div>
          <div className="relative flex flex-col gap-1">
            <Label htmlFor="friendName">Choose partner:</Label>
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
                <div className="absolute left-0 top-full z-50 max-h-[300px] min-w-[250px] overflow-y-auto">
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
            {errors.friendName && (
              <span
                data-testid="error"
                className="font-medium text-destructive"
              >
                {errors.friendName.message}
              </span>
            )}
          </div>
          {badRequestErrorMessage && (
            <span data-testid="error" className="font-medium text-destructive">
              {badRequestErrorMessage}
            </span>
          )}
          <div className="flex w-full items-center gap-4">
            <Button type="submit" className="w-full">
              Create
            </Button>
            {addFriendButton && otherName && (
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={() => createFriendRequest({ name: otherName })}
              >
                Add friend <Users size={16} />
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarPopup;
