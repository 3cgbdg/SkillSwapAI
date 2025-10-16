"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"

const ModuleAccordion = () => {
    const [isActive, setIsActive] = useState<boolean>(false);
    return (
        <div className="bg-neutral-100 flex flex-col _border rounded-[10px] p-4 min-h-[94px]">
            <div className="w-full flex justify-between items-center h-[60px]">
                <div className="flex items-center gap-4 max-w-[450px]">
                    <input checked={true} className="size-4" type="checkbox" />
                    <h3 className="text-lg leading-7 font-semibold ">Module name</h3>
                </div>
                <div className="flex items-center gap-10">
                    <div className="p-1 text-sm font-medium text-white bg-blue rounded-xl">Completed</div>
                    <button onClick={() => setIsActive(!isActive)} className={`${isActive ? 'rotate-180' : ''} hover:shadow-2xs p-1 rounded-4xl  cursor-pointer transition-all`}>
                        <ChevronDown />
                    </button>
                </div>
            </div>
            {isActive &&
                <div className={`h-fit flex  flex-col gap-4`}>
                    <div className=" flex flex-col gap-2">
                        <h4 className="font-semibold">Objectives:</h4>
                        <div className="">
                            <p className="text-sm leading-5 text-gray">Implement conditional logic using `if`, `else if`, and `else` statements.</p>
                            <p className="text-sm leading-5 text-gray">Implement conditional logic using `if`, `else if`, and `else` statements.</p>
                        </div>
                    </div>
                    <div className=" flex flex-col gap-2">
                        <h4 className="font-semibold">Activities:</h4>
                        <div className="">
                            <p className="text-sm leading-5 text-gray">Build a simple calculator using conditional statements.</p>
                            <p className="text-sm leading-5 text-gray">Build a simple calculator using conditional statements.</p>
                        </div>
                    </div>
                </div>}
        </div>
    )
}

export default ModuleAccordion