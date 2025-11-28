"use client";

import { memo, useState } from "react";
import { format } from "date-fns";
import { TableCellType } from "./Calendar";
import { ReceiptText, X } from "lucide-react";
import Link from "next/link";

const DesktopGridCalendar = ({
  tableCells,
}: {
  tableCells: TableCellType[];
}) => {
  const [details, setDetails] = useState<null | {
    descr?: string;
    meetingLink: string | null;
  }>(null);

  return (
    <div className="relative">
      {details !== null && (
        <div className="absolute -top-20 max-h-[250px] overflow-auto left-10 p-2 min-w-[150px] max-w-[300px]   _border rounded-md z-150 bg-white">
          {details.descr && (
            <div className="border-b-1 border-gray-300 pb-1 mb-1">
              <div className="flex items-center justify-between">
                <h3 className="text-black font-medium">Description</h3>
                <button
                  onClick={() => setDetails(null)}
                  className="button-transparent"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-gray text-xs leading-4">{details.descr}</p>
            </div>
          )}
          {details.meetingLink && (
            <>
              <p className="text-gray text-xs leading-4">
                Meeting Link:{" "}
                <Link
                  href={details.meetingLink}
                  className="font-medium hover:underline text-black"
                >
                  {details.meetingLink}
                </Link>{" "}
              </p>
            </>
          )}
        </div>
      )}
      <div className="grid grid-cols-8 border-b-1 border-neutral-300 pr-[15px]">
        <div className="flex flex-col gap-0.5 not-last:border-r-1 items-center border-neutral-300"></div>
        {tableCells.map((cell, idx) => (
          <div className="flex flex-col gap-0.5 items-center " key={idx}>
            <span className="text-sm leading-5 font-medium">
              {format(cell.date, "E")}
            </span>
            <span className="leading-7 text-lg font-bold ">
              {format(cell.date, "d")}
            </span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-8 overflow-y-auto relative h-[440px] ">
        <div className="border-r-1 border-neutral-300 ">
          {Array.from(
            { length: 24 },
            (_, i) => `${i.toString().padStart(2, "0")}:00`
          ).map((value, idx) => (
            <div
              key={idx}
              className="min-h-[100px] flex text-sm leading-4 text-gray items-center justify-center"
            >
              {value}
            </div>
          ))}
        </div>

        <div className="col-span-7 grid grid-cols-7 relative">
          {tableCells.map((cell) => (
            <div
              key={cell.date.toISOString()}
              className="_border p-1 grid  "
              style={{ gridTemplateRows: "repeat(24, 100px)" }}
            >
              {cell.sessions.map((session, i) => (
                <div
                  key={session.id}
                  style={{
                    backgroundColor: session.color,
                    gridRowStart: session.start + 1,
                    gridRowEnd: session.end === 0 ? 25 : session.end + 1,
                  }}
                  className="text-xs text-white rounded relative _border p-2 flex flex-col gap-1 w-full font-semibold"
                >
                  <div className="flex items-center justify-between">
                    <span className="wrap-anywhere">{session.title}</span>
                    {session.description != null && (
                      <button
                        onClick={() =>
                          setDetails({
                            descr: session.description,
                            meetingLink: session.meetingLink,
                          })
                        }
                        className="hover:text-blue cursor-pointer underline text-lightBlue"
                      >
                        <ReceiptText size={16} />
                      </button>
                    )}
                  </div>
                  <span>
                    ({session.start} - {session.end})
                  </span>
                  <span className="">
                    Status: {session.status == "PENDING" ? "Pending" : "Agreed"}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(DesktopGridCalendar);
