"use client"

import { api } from "@/api/axiosInstance";
import { formatDate } from "@/app/utils/calendar";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { addSession } from "@/redux/sessionsSlice";
import { IFriend, ISession } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";




// colors for events bg
const colors = ['#5C6BC0', '#FF7043', '#43A047']

// type for form
type formType = ISession & { friendName: string }

const CalendarPopup = ({ year, month, setAddSessionPopup }: { year: number, month: number, setAddSessionPopup: Dispatch<SetStateAction<boolean>> }) => {
    const { register, watch, handleSubmit, setValue, formState: { errors } } = useForm<formType>();
    const dispatch = useAppDispatch();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const [chars, setChars] = useState<string>("");
    const [friends, setFriends] = useState<IFriend[] | null>(null);


    // searching friends by name
    const mutationSearch = useMutation({
        mutationFn: async () => { const res = await api.get("/friends"); return res.data },
        onSuccess: (data) => {
            setFriends(data);
        }
    })

    // mutation for createing session request
    const createSessionMutation = useMutation({
        mutationKey: ["session"],
        mutationFn: async (data: ISession) => {
            const res = await api.post("/sessions", { ...data, color: colors[Math.floor(Math.random() * 3)] });
            return res.data;
        },
        onSuccess: (data) => {
            console.log(data);
            setAddSessionPopup(false);
        }
    })
    const createSession: SubmitHandler<formType> = async (data) => {
        dispatch(addSession(data));
        const { friendName, ...newData } = data;
        createSessionMutation.mutate(newData)
    }
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
                                        validTimeRange: value => Number(value) > Number(startHour) || "Must be valid time range"

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
                                if (e.target.value.length === 1) {
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
                                                    <button className="cursor-pointer hover:opacity-75" key={idx} onClick={() => { setValue('friendId', friend.id); setValue('friendName', friend.name); setChars("") }}>
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
                    <button className="button-blue">Create</button>
                </form>
            </div>
        </div>
    )
}

export default CalendarPopup