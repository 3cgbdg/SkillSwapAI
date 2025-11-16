"use client"

import { memo } from "react";
import {
    format,
} from 'date-fns';
import { TableCellType } from "./Calendar";

const TouchScreenCalendar = ({ tableCells }: { tableCells: TableCellType[] }) => {



    return (
        <div className="flex flex-col gap-6 p-4">
            {tableCells.map(cell => (
                <div key={cell.date.toISOString()} className="flex flex-col gap-2">
                    <div className="text-xs leading-4 font-semibold text-gray uppercase">{format(cell.date, 'EEEE')}, {format(cell.date, 'MMMM')} {format(cell.date, 'd')}</div>
                    <div className="flex flex-col gap-2">
                        {cell.sessions.length !== 0 ? cell.sessions.map(session => (
                            <div key={session.id} style={{ borderColor: session.color }} className="rounded-[10px] p-2 _border gap-1 flex flex-col ">
                                <p className="text-xs leading-4 font-medium text-blue">{session.start}:00 - {session.end}:00</p>
                                <h2 className="font-medium text-sm leading-5">{session.title}</h2>
                            </div>
                        )) :
                            (
                                <div className="p-2 _border rounded-md bg-neutral-200 text-sx leading-4 text-gray">No events scheduled for this day.</div>
                            )
                        }
                    </div>
                </div>
            ))}
        </div>
    )
}

export default memo(TouchScreenCalendar)