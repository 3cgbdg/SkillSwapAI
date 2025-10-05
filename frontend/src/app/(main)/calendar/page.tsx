"use client"

import Calendar from "@/components/calendar/Calendar"
import { useAppSelector } from "@/hooks/reduxHooks";
import { useEffect, useState } from "react";


const Page = () => {
    const [now, setNow] = useState(new Date());
    const { sessions } = useAppSelector(state => state.sessions)
    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 60 * 1000);
        return () => clearInterval(interval);
    }, []);
    const upcoming = sessions && sessions.filter(s => new Date(s.start) > now);
    return (
        <div className="grid grid-cols-3 gap-8">
            <div className="_border overflow-hidden rounded-[10px] col-span-2">
                <Calendar />
            </div>
            <div className="_border overflow-hidden rounded-[10px] col-span-1">
                {/* header */}
                <div className="border-b-1 border-neutral-300">
                    <div className=" gap-2 p-6 ">
                        <h2 className="text-xl leading-7 font-bold">Upcoming Sessions</h2>
                    </div>
                </div>
                <div className="flex flex-colg gap-8">
                    {upcoming && upcoming.slice(0, 6).map(item => (
                        <div className="flex flex-col gap-2 w-full   p-4">
                            <div className="flex justify-between  items-center ">
                                <span className="text-sm font-semibold">Today</span>
                                <span className=" text-xs leading-4 ">{item.start}:00</span>
                            </div>
                            <h3 className="leading-5 font-semibold">{item.title} with {item.friendId}</h3>
                            <span className="text-xs  laeding-4 font-semibold px-3 py-1 bg-orange rounded-xl w-fit text-white">Tab</span>

                        </div>
                    ))}

                </div>
            </div>
        </div>
    )
}

export default Page