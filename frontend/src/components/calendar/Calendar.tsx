"use client";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { ISession } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CalendarPopup from "./CalendarPopup";
import { setSessions } from "@/redux/sessionsSlice";
import SessionsService from "@/services/SessionsService";
import { useSearchParams } from "next/navigation";
import {
    addDays,
    format,
    getMonth,
    getYear,
    isSameDay,
    startOfWeek
} from 'date-fns';
import DesktopGridCalendar from "./DesktopGridCalendar";
import TouchScreenCalendar from "./TouchScreenCalendar";

export type TableCellType = {
    sessions: ISession[],
    date: Date,
};


const fetchSessions = async (month: number) => {
    return SessionsService.getSessions(month);
}


const Calendar = () => {
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const [addSessionPopup, setAddSessionPopup] = useState<boolean>(false);
    const [otherName, setOtherName] = useState<string | null>(null);
    const [weekStartDate, setWeekStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const currentMonth = getMonth(weekStartDate);

    useEffect(() => {
        const schedule = searchParams.get('schedule');
        const name = searchParams.get('name');
        if (schedule !== 'true' || !name) return;
        setAddSessionPopup(true);
        setOtherName(name);
    }, [searchParams]);

    // fetching sessions
    const { data: monthSessions } = useQuery({
        queryKey: ['sessions', currentMonth],
        queryFn: () => fetchSessions(currentMonth),
        refetchInterval: 60 * 60 * 1000,
    });

    // getting todays upcoming sessions
    useEffect(() => {
        if (monthSessions) {
            const today = new Date();
            const currentSessions = monthSessions.filter(session =>
                isSameDay(new Date(session.date), today)
            );
            dispatch(setSessions(currentSessions));
        }
    }, [monthSessions, dispatch]);

    // nav buttons
    const handlePrevWeek = () => {
        setWeekStartDate(prevDate => addDays(prevDate, -7));
    };

    const handleNextWeek = () => {
        setWeekStartDate(prevDate => addDays(prevDate, 7));
    };

    // creating days dates for the week
    const visibleDays = useMemo(() => {
        const days: Date[] = [];
        for (let i = 0; i < 7; i++) {
            days.push(addDays(weekStartDate, i));
        }
        return days;
    }, [weekStartDate]);
    // creating cells
    const tableCells = useMemo((): TableCellType[] => {
        if (!monthSessions) {
            return visibleDays.map(date => ({ date, sessions: [] }));
        }

        return visibleDays.map(dayDate => ({
            date: dayDate,
            sessions: monthSessions
                .filter(session => isSameDay(new Date(session.date), dayDate))
                .sort((a, b) => a.start - b.start)
        }));
    }, [visibleDays, monthSessions]);




    return (
        <div className="">
            {/* header */}
            <div className="bg-neutral-200 px-4 py-4.5 flex md:flex-row flex-col gap-6 md:justify-between md:items-center border-b-1 border-neutral-300">

                <h2 className="text-xl leading-7 font-semibold">
                    {format(weekStartDate, 'MMMM yyyy')}
                </h2>

                <div className="flex items-center gap-4">
                    <button onClick={handlePrevWeek} className="button-transparent bg-white! flex gap-2">
                        <ArrowLeft size={16} />
                        <span>Previous 7 days</span>
                    </button>
                    <button onClick={handleNextWeek} className="button-transparent bg-white! flex gap-2">
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
                <div className="md:block hidden">
                    <DesktopGridCalendar tableCells={tableCells} />
                </div>
                <div className="md:hidden block">
                    <TouchScreenCalendar tableCells={tableCells} />

                </div>
            </div>

            {
                addSessionPopup &&
                <CalendarPopup otherName={otherName} year={getYear(new Date())} month={currentMonth} setAddSessionPopup={setAddSessionPopup} />

            }
        </div >
    )
};

export default Calendar;