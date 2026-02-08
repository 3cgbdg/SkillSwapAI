"use client";
import Calendar from "@/components/calendar/Calendar";
import Spinner from "@/components/Spinner";
import { Suspense, useEffect, useMemo, useState } from "react";
import useSessions from "@/hooks/useSessions";

const Page = () => {
  const [now, setNow] = useState(new Date());

  const { data: sessions = [] } = useSessions();

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const upcoming = useMemo(() => {
    if (!sessions) return [];
    return sessions
      .filter((s) => s.start > now.getHours())
      .sort((a, b) => a.start - b.start);
  }, [sessions, now]);
  return (
    <div className="grid grid-cols-3 gap-8 items-start">
      <div className="_border overflow-hidden rounded-[10px] col-span-3 xl:col-span-2">
        <Suspense fallback={<Spinner size={30} color="blue" />}>
          <Calendar />
        </Suspense>
      </div>
      <div className="_border overflow-hidden  rounded-[10px] col-span-3 xl:col-span-1">
        {/* header */}
        <div className="border-b border-neutral-300">
          <div className=" gap-2 p-6 ">
            <h2 className="text-xl leading-7 font-bold">Upcoming Sessions</h2>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-2">
          {upcoming && upcoming.length > 0 ? (
            upcoming.slice(0, 6).map((item) => (
              <div
                style={{ backgroundColor: item.color }}
                key={item.id}
                className="flex flex-col gap-2 w-full _border rounded-xl  p-4"
              >
                <div className="flex justify-between  items-center ">
                  <span className="text-sm font-semibold">Today</span>
                  <span className=" text-xs leading-4 ">{item.start}:00</span>
                </div>
                <h3 className="leading-5 font-semibold">
                  {item.title} with {item.friend.name}
                </h3>
              </div>
            ))
          ) : (
            <h3 className="p-10 text-center ">There are no upcoming events</h3>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
