"use client"
import { formatDate } from "@/app/utils/calendar";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { addSession } from "@/redux/sessionsSlice";
import { FormTypeSession, IFriend } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { Plus, Users, X } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { TableCellType } from "./Calendar";
import { useSocket } from "@/context/SocketContext";
import FriendsService from "@/services/FriendsService";
import SessionsService from "@/services/SessionsService";
import RequestsService from "@/services/RequestsService";

const CalendarPopup = ({ year, month, setTableCells, setAddSessionPopup, otherName }: { otherName: string | null, year: number, month: number, setAddSessionPopup: Dispatch<SetStateAction<boolean>>, setTableCells: Dispatch<SetStateAction<TableCellType[]>> }) => {
    const { register, watch, handleSubmit, setValue, formState: { errors } } = useForm<FormTypeSession>();
    const dispatch = useAppDispatch();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const { socket } = useSocket();
    const [chars, setChars] = useState<string>("");
    const [addFriendButton, setAddFriendButton] = useState<boolean>(false);
    const [friends, setFriends] = useState<IFriend[] | null>(null);
    const [badRequestErrorMessage, setBadRequestErrorMessage] = useState<string | null>(null);
    // searching friends by name
    const mutationSearch = useMutation({
        mutationFn: async () => FriendsService.getFriends(),
        onSuccess: (data) => {
            setFriends(data);
        }
    })

    //create friend request 
    const { mutate: createFriendRequest } = useMutation({
        mutationFn: async (str: string) => RequestsService.createFriendRequest({ name: str }),
    })

    // mutation for creating session request
    const createSessionMutation = useMutation({
        mutationKey: ["session"],
        mutationFn: async (data: Omit<FormTypeSession, 'friendName'>) => SessionsService.createSession(data),
        onSuccess: (data) => {
            setAddSessionPopup(false);
            // if its current day event adding to global state
            if (new Date(data.date).getDate() == new Date().getDate())
                dispatch(addSession(data));
            if (socket)
                socket.emit('createSessionRequest', { id: data.id })
            setTableCells(prev => prev.map(item => {
                if (new Date(item.date).getDate() === new Date(data.date).getDate()) {
                    const updatedSessions = [...item.sessions, data].sort((a, b) => a.start - b.start)
                    return ({ date: item.date, sessions: updatedSessions })
                } else {
                    return item
                }
            }))
        },
        onError: (error: any) => {
            setBadRequestErrorMessage(error.response?.data?.message || error.message);
        }
    })
    const createSession: SubmitHandler<FormTypeSession> = async (data) => {
        const { friendName, ...newData } = data;
        if (friends) {
            const realFriend = friends.find(item => item.name === friendName);
            if (realFriend) {
                newData.friendId = realFriend.id;
                createSessionMutation.mutate(newData)

            }
            else {
                setBadRequestErrorMessage('There`s no such friend in your list. Firstly add Friend!')
                setAddFriendButton(true);
                return;
            }
        }
    }

    useEffect(() => {
        if (otherName) {
            setValue("friendName", otherName);
            mutationSearch.mutate();
        }
    }, [otherName])

    const startHour = watch('start');

    return (
        <div className=" absolute   top-0 left-0 size-full bg-[#6B72808C] flex items-center justify-center">

            <div className="_border rounded-md p-4  bg-white! max-w-[500px]  w-full">
                <div className="flex w-full mb-6  items-center justify-between">
                    <h2 className="text-lg leadiing-7 font-semibold">Create a new Session</h2>

                    <button onClick={() => setAddSessionPopup(false)} className=" button-transparent">
                        < X size={20} className="" />
                    </button>
                </div>
                <form onSubmit={handleSubmit(createSession)} className="flex px-4  flex-col gap-4 w-full">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm leading-[22px] font-medium" htmlFor="title">Title</label>
                        <div className="relative input flex items-center gap-2 text-gray text-sm leading-[22px] ">
                            <input  {...register("title", {
                                validate: {
                                    isNotEmpty: value => value.trim() !== "" || "Field is required",
                                }
                            })} className="w-full outline-none" placeholder="Enter title" type="text" id="title" />
                        </div>
                        {errors.title && (
                            <span data-testid='error' className="text-red-500 font-medium ">
                                {errors.title.message}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm leading-[22px] font-medium" htmlFor="description">Description</label>
                        <div className="relative input flex items-center gap-2 text-gray text-sm leading-[22px] ">
                            <textarea maxLength={50}  {...register("description")} className="w-full outline-none min-h-10" placeholder="Enter title" id="description" />
                        </div>
                    </div>
                    <div className="flex items-start gap-4 justify-between">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm leading-[22px] font-medium" htmlFor="start">Start Hour</label>
                            <div className="relative input flex items-center gap-2 text-gray text-sm leading-[22px] ">
                                <input  {...register("start", {
                                    validate: {
                                        isNotEmpty: value => value.trim() !== "" || "Field is required",
                                        onlyNumbers: value => /^[0-9]+$/.test(value) || "Must be only numbers",
                                        validNumRange: value => Number(value) >= 0 && Number(value) < 24 || "Must be valid hour",
                                    }
                                })} className="w-full outline-none" placeholder="Enter start hour" type="text" id="start" />
                            </div>
                            {errors.start && (
                                <span data-testid='error' className="text-red-500 font-medium ">
                                    {errors.start.message}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm leading-[22px] font-medium" htmlFor="end">End Hour</label>
                            <div className="relative input flex items-center gap-2 text-gray text-sm leading-[22px] ">
                                <input  {...register("end", {
                                    validate: {
                                        isNotEmpty: value => value.trim() !== "" || "Field is required",
                                        onlyNumbers: value => /^[0-9]+$/.test(value) || "Must be only numbers",
                                        validNumRange: value => Number(value) >= 0 && Number(value) < 24 || "Must be valid hour",
                                        validTimeRange: value => {


                                            if (Number(value) === 0 && Number(startHour) <= 23) return true;
                                            return Number(value) > Number(startHour) || "Must be valid time range";
                                        }
                                    }
                                })} className="w-full outline-none" placeholder="Enter end hour" type="text" id="end" />
                            </div>
                            {errors.end && (
                                <span data-testid='error' className="text-red-500 font-medium ">
                                    {errors.end.message}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm leading-[22px] font-medium" htmlFor="date">Date</label>
                        <div className="relative input flex items-center gap-2 text-gray text-sm leading-[22px] ">
                            <input max={formatDate(lastDay)} min={formatDate(firstDay)}  {...register("date", { required: "Field is required" })} className="w-full outline-none " type="date" placeholder="Enter title" id="date" />
                        </div>
                        {errors.date && (
                            <span data-testid='error' className="text-red-500 font-medium ">
                                {errors.date.message}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-2 relative">
                        <label className="text-sm leading-[22px] font-medium" htmlFor="friendName">Choose partner:</label>
                        <div className=" input flex items-center gap-2 text-gray text-sm leading-[22px] ">
                            <input type="text" placeholder="Find by name" id="friendName"   {...register("friendName", { required: "Field is required" })} className="w-full outline-none " onChange={async (e) => {

                                setChars(e.target.value);
                                if (e.target.value.length === 1 && !friends) {
                                    await mutationSearch.mutate();
                                    console.log(chars)

                                }
                            }}
                            />
                            {friends && chars.length > 0 &&
                                <div className="left-0 top-full absolute z-10 min-w-[250px] max-h-[300px] overflow-y-auto">
                                    <div className="flex flex-col gap-2 mt-2 p-2  _border bg-white rounded-md ">
                                        <div className="flex flex-col  gap-1 max-h-[500px]  border-neutral-300">
                                            {friends.filter(friend => friend.name.toLowerCase().includes(chars.toLocaleLowerCase())).map((friend, idx) => {
                                                return (
                                                    <button className="cursor-pointer hover:opacity-75" key={idx} onClick={() => { setValue('friendName', friend.name); setChars("") }}>
                                                        {friend.name}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>}
                        </div>
                        {errors.friendName && (
                            <span data-testid='error' className="text-red-500 font-medium ">
                                {errors.friendName.message}
                            </span>
                        )}
                    </div>
                    {badRequestErrorMessage && (
                        <span data-testid='error' className="text-red-500 font-medium ">
                            {badRequestErrorMessage}
                        </span>
                    )}
                    <div className="flex w-full gap-4 items-center">
                        <button className="button-blue w-full">Create</button>
                        {
                            addFriendButton && otherName &&
                            <button onClick={() => createFriendRequest(otherName)} className="button-transparent w-full rounded-md! flex items-center gap-2">Add friend <Users size={16} /></button>

                        }
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CalendarPopup