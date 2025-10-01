"use client";

import { ArrowRight } from "lucide-react";

// test interface
interface Session {
    id: string;
    title: string;
    start: string;
    end: string;
    description?: string;
}

const Calendar = () => {


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
                    <button className="button-blue flex gap-2 rounded-2xl!">
                        Add Session
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
