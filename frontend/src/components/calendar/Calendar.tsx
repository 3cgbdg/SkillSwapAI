"use client";
import { api } from "@/api/axiosInstance";
import { getDates, } from "@/app/utils/calendar";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { addSession } from "@/redux/sessionsSlice";
import { ISession } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";


// colors for events bg
const colors = ['#5C6BC0', '#FF7043', '#43A047']

const Calendar = () => {
    const [currentDays, setCurrentDays] = useState<{ day: number, weekDay: string }[]>(getDates())
    const [tableCells, setTableCells] = useState<{ session: null | ISession }[]>(Array.from({ length: 7 * 24 }));
    const [addSessionPopup, setAddSessionPopup] = useState<boolean>(false);
    const { register, handleSubmit, formState: { errors } } = useForm<ISession>();
    const dispatch = useAppDispatch();
    useEffect(() => {
        setTableCells(prev => prev.map((value, idx) => {
            if (idx == 4) {
                return ({ session: { id: '1', title: "hello", start: `${String(new Date().getHours()).padStart(2, "0")}:00`, end: `${String(new Date().getHours() + 3).padStart(2, "0")}:00`, color: "#9077f3ff", date: new Date() } });
            } else {
                return ({ ...value })
            }
        }));
    }, []);

    // mutation for createing session request

    const createSessionMutation = useMutation({
        mutationKey: ["session"],
        mutationFn: async (data: ISession) => await api.post("/sessions", { ...data, color: colors[Math.floor(Math.random() * 3)] }),
    })

    const createSession: SubmitHandler<ISession> = async (data) => {
        dispatch(addSession(data))
        createSessionMutation.mutate(data)
    }

    return (
        <div className="">
            {/* header */}
            <div className="bg-neutral-200 px-4 py-4.5 flex justify-between items-center border-b-1 border-neutral-300">
                <h2 className="text-xl leading-7 font-semibold">October 2024</h2>
                <div className="flex items-center gap-4">
                    <button className="button-transparent bg-white! flex gap-2">
                        <span>Week</span>
                        <ArrowRight size={16} />
                    </button>
                    <button onClick={() => {
                        setAddSessionPopup(true);
                    }} className="button-blue flex gap-2 rounded-2xl!">
                        Add Session
                    </button>
                </div>
            </div>
            <div className="mt-6 w-full">
                <div className="grid grid-cols-8 border-b-1 border-neutral-300 pr-[15px]">
                    <div className="flex flex-col gap-0.5 not-last:border-r-1  items-center border-neutral-300" >

                    </div>
                    {
                        currentDays.map((day, idx) => (
                            <div className="flex flex-col gap-0.5   items-center " key={idx}>
                                <span className="text-sm leading-5 font-medium">{day.weekDay}</span>
                                <span className="leading-7 text-lg font-bold ">{day.day}</span>
                            </div>
                        ))
                    }
                </div>
                <div className="grid grid-cols-8 overflow-y-auto h-[440px] ">
                    <div className="border-r-1  border-neutral-300 ">
                        {Array.from({ length: 24 }, (_, i) =>
                            `${i.toString().padStart(2, "0")}:00`
                        ).map((value, idx) => (
                            <div key={idx} className="h-[73px] flex text-sm leading-4 text-gray items-center  justify-center">{value}</div>
                        ))}
                    </div>
                    <div className="col-span-7 grid grid-cols-7">
                        {tableCells.map((value, idx) => (
                            <div key={idx} className={`border-b-1 border-r-1 border-neutral-300 p-1 ${value ? "" : ""}`}>
                                <div className="h-16">
                                    {value?.session &&
                                        <div style={{ backgroundColor: value.session.color }} className={`text-xs leading-4 font-semibold border-1 p-1 h-full flex flex-col gap-1 justify-between py-2 text-white rounded-t-md `}>
                                            <span>{value.session?.title}</span>
                                            <span className="text-[10px] leading-3 font-normal">{value.session.start}-{value.session.end}</span>
                                        </div>
                                    }
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {/* popup for adding session */}
            {addSessionPopup &&
                <div className=" absolute   top-0 left-0 size-full bg-[#6B72808C] flex items-center justify-center  ">
                    <div className="_border rounded-md p-4  bg-white! max-w-[500px]  w-full">
                        <div className="flex w-full mb-6  items-center justify-between">
                            <h2 className="text-lg leadiing-7 font-semibold">Create a new Session</h2>

                            <button onClick={() => setAddSessionPopup(false)} className=" button-transparent">
                                < X size={20} className="" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(createSession)} className="flex px-4 flex-col gap-4 w-full">
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
                                    <textarea  {...register("description")} className="w-full outline-none min-h-10" placeholder="Enter title" id="description" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4 justify-between">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm leading-[22px] font-medium" htmlFor="start">Start Hour</label>
                                    <div className="relative input flex items-center gap-2 text-gray text-sm leading-[22px] ">
                                        <input  {...register("start", {
                                            validate: {
                                                isNotEmpty: value => value.trim() !== "" || "Field is required",
                                                onlyNumbers: value => /^[0-9]+$/.test(value) || "Must be only numbers",
                                                validNumRange: value => Number(value) >= 0 && Number(value) < 24 || "Must be valid hour"
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
                                                validNumRange: value => Number(value) >= 0 && Number(value) < 24 || "Must be valid hour"

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
                                    <input  {...register("date", { required: "Field is required" })} className="w-full outline-none " type="date" placeholder="Enter title" id="date" />
                                </div>
                                {errors.date && (
                                    <span data-testid='error' className="text-red-500 font-medium ">
                                        {errors.date.message}
                                    </span>
                                )}
                            </div>
                            <button className="button-blue">Create</button>
                        </form>
                    </div>
                </div>
            }
        </div >

    )
};

export default Calendar;
