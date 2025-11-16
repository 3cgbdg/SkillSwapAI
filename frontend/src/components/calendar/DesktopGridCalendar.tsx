"use client"

import { memo } from "react";
import {

    format,

} from 'date-fns';
import { TableCellType } from "./Calendar";



const DesktopGridCalendar = ({ tableCells }: { tableCells: TableCellType[] }) => {



    return (
        <div><div className="grid grid-cols-8 border-b-1 border-neutral-300 pr-[15px]">
            <div className="flex flex-col gap-0.5 not-last:border-r-1 items-center border-neutral-300" >
            </div>
            {
                tableCells.map((cell, idx) => (
                    <div className="flex flex-col gap-0.5 items-center " key={idx}>
                        <span className="text-sm leading-5 font-medium">{format(cell.date, 'E')}</span>
                        <span className="leading-7 text-lg font-bold ">{format(cell.date, 'd')}</span>
                    </div>
                ))
            }
        </div>
            <div className="grid grid-cols-8 overflow-y-auto h-[440px] ">
                <div className="border-r-1 border-neutral-300 ">
                    {Array.from({ length: 24 }, (_, i) =>
                        `${i.toString().padStart(2, "0")}:00`
                    ).map((value, idx) => (
                        <div key={idx} className="min-h-[100px] flex text-sm leading-4 text-gray items-center justify-center">{value}</div>
                    ))}
                </div>
                <div className="col-span-7 grid grid-cols-7">
                    {
                        tableCells.map((cell) => (
                            <div
                                key={cell.date.toISOString()}
                                className="_border p-1 grid"
                                style={{ gridTemplateRows: 'repeat(24, 100px)' }}
                            >
                                {cell.sessions.map((session) => (
                                    <div
                                        key={session.id}

                                        style={{
                                            backgroundColor: session.color,
                                            gridRowStart: session.start + 1,
                                            gridRowEnd: session.end === 0 ? 25 : session.end + 1,
                                        }}
                                        className="text-xs text-white rounded p-2 flex flex-col gap-1 w-full font-semibold"
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
            </div></div>
    )
}

export default memo(DesktopGridCalendar)