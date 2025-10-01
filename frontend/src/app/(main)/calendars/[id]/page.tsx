"use client"

import Calendar from "@/components/calendar/Calendar"

const Page = () => {
    return (
        <div className="grid grid-cols-3 gap-8">
            <div className="_border overflow-hidden rounded-[10px] col-span-2">
                <Calendar />
            </div>
            <div className="_border overflow-hidden rounded-[10px] col-span-1"></div>
        </div>
    )
}

export default Page