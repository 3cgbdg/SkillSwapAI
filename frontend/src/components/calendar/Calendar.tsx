"use client";
import { api } from "@/api/axiosInstance";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { ISession, SessionStatusEnum } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import CalendarPopup from "./CalendarPopup";
import { setSessions } from "@/redux/sessionsSlice";
import { useSocket } from "@/context/SocketContext";

export type TableCellType = {
    sessions: ISession[],
    date: Date,
};



const Calendar = () => {
    /// to limit calendar date range (one month)
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const { socket } = useSocket();
    ///
    const [tableCells, setTableCells] = useState<TableCellType[]>([]);
    const [addSessionPopup, setAddSessionPopup] = useState<boolean>(false);
    const [monthWeekIdx, setMonthWeekIdx] = useState<number>(0);
    const dispatch = useAppDispatch();


    //query for getting sessions 
    const { data } = useQuery({
        queryKey: ['sessions', month],
        queryFn: async () => {
            const res = await api.get("/sessions", { params: { month } });
            return res.data as ISession[];
        },
        refetchInterval: 60 * 60 * 1000,
    })
    //


    useEffect(() => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days: TableCellType[] = [];

        for (let i = 0; i < lastDay.getDate(); i++) {
            const date = new Date(firstDay);
            date.setDate(date.getDate() + i);
            days.push({ date, sessions: [] });
        }

        setTableCells(days);
    }, [month, year]);


    useEffect(() => {
        if (data) {
            setTableCells(prev => prev.map(dayCell => ({
                ...dayCell,
                sessions: data.filter(session => new Date(session.date).getDate() === new Date(dayCell.date).getDate()).sort((a, b) => a.start - b.start)
            })));
            // getting right month week idx
            const today = new Date();
            const dayIdx = today.getDate() - 1;
            const weekIdx = Math.floor(dayIdx / 7);
            setMonthWeekIdx(weekIdx);
            const currentSessions = data.filter(session => new Date(session.date).getDate() === today.getDate());
            //    adding current day sesions to global state 
            dispatch(setSessions(currentSessions));
        }
    }, [data]);

    return (
        <div className="">
            {/* header */}
            <div className="bg-neutral-200 px-4 py-4.5 flex justify-between items-center border-b-1 border-neutral-300">
                <h2 className="text-xl leading-7 font-semibold">October 2024</h2>
                <div className="flex items-center gap-4">
                    <button disabled={monthWeekIdx == 0} onClick={() => setMonthWeekIdx(prev => prev != 0 ? prev - 1 : 0)} className="button-transparent disabled:bg-gray! bg-white! flex gap-2">
                        <ArrowLeft size={16} />
                        <span>Previous 7 days</span>
                    </button>
                    <button disabled={monthWeekIdx == 4} onClick={() => setMonthWeekIdx(prev => prev != 4 ? prev + 1 : 4)} className="button-transparent disabled:bg-gray! bg-white! flex gap-2">
                        <span>Next 7 days</span>
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
                        tableCells.slice(7 * monthWeekIdx, (monthWeekIdx + 1) * 7).map((cell, idx) => (
                            <div className="flex flex-col gap-0.5   items-center " key={idx}>
                                <span className="text-sm leading-5 font-medium">{cell.date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                <span className="leading-7 text-lg font-bold ">{cell.date.getDate()}</span>
                            </div>
                        ))
                    }
                </div>
                <div className="grid grid-cols-8 overflow-y-auto h-[440px] ">
                    <div className="border-r-1  border-neutral-300 ">
                        {Array.from({ length: 24 }, (_, i) =>
                            `${i.toString().padStart(2, "0")}:00`
                        ).map((value, idx) => (
                            <div key={idx} className="min-h-[100px] flex text-sm leading-4 text-gray items-center  justify-center">{value}</div>
                        ))}
                    </div>
                    <div className="col-span-7 grid grid-cols-7">
                        {
                            tableCells
                                .slice(7 * monthWeekIdx, 7 * (monthWeekIdx + 1))
                                .map((cell) => (
                                    <div key={cell.date.toISOString()} className="_border p-1 relative overflow-hidden">
                                        {cell.sessions.map((session) => (
                                            <div
                                                key={session.id}
                                                style={{ backgroundColor: session.color, marginTop: 100.5 * (session.start), height: session.end != 0 ? 100 * (session.end - session.start) : 100 * (24 - session.start) }}
                                                className="text-xs text-white rounded p-2 flex flex-col gap-1 top-0 left-0 absolute w-full  font-semibold h-[100px]"
                                            >
                                                <span>{session.title}</span>
                                                <span>({session.start} - {session.end})</span>
                                                <span className="">Status: {session.status == "PENDING" ? 'Pending' : 'Agreed'}</span>

                                            </div>
                                        ))}
                                    </div>
                                ))
                        }
                    </div>

                </div>
            </div>

            {/* popup for adding session */}
            {
                addSessionPopup &&
                <CalendarPopup month={month} year={year} setTableCells={setTableCells} setAddSessionPopup={setAddSessionPopup} />
            }
        </div >

    )
};

export default Calendar;
