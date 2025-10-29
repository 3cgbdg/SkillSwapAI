"use client"

import { IGeneratedModule } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { ChevronDown, Clock, Link as LinkIcon } from "lucide-react"
import Link from "next/link";
import { Dispatch, SetStateAction } from "react"

const ModuleAccordion = ({ module,setIsActive ,isActive,idx}: { module: IGeneratedModule,isActive:null|number,idx:number, setIsActive:Dispatch<SetStateAction<null|number>> }) => {
    const {mutate} = useMutation({
        mutationFn:async()=>{
            // TODO!
        }
    })
    return (
        <div className="bg-neutral-100 flex flex-col _border rounded-[10px] p-4 min-h-[94px]">
            <div className="w-full flex justify-between items-center h-[60px]">
                <div className="flex items-center gap-4 max-w-[450px]">
                    <input disabled defaultChecked={module.status != 'INPROGRESS'} className="size-4" type="checkbox" />
                    <h3 className="text-lg leading-7 font-semibold ">{module.title}</h3>
                </div>
                <div className="flex items-center gap-10">
                    <div className={`p-1 text-sm font-medium text-white rounded-xl ${module.status != 'INPROGRESS' ? 'bg-blue ' : 'bg-neutral-200 text-gray!'}`}>{module.status != 'INPROGRESS' ? 'Completed' : 'In Progress'}</div>
                    <button onClick={() => setIsActive(isActive == idx ?null : idx )} className={`${isActive==idx ? 'rotate-180' : ''} hover:shadow-2xs p-1 rounded-4xl  cursor-pointer transition-all`}>
                        <ChevronDown />
                    </button>
                </div>
            </div>
            {isActive == idx &&
                <div className={`h-fit flex  flex-col gap-4`}>
                    <div className=" flex flex-col gap-2">
                        <h4 className="font-semibold">Objectives:</h4>
                        <div className="">
                            {module.objectives.map((objective, idx) => (
                                <p key={idx} className="text-sm leading-5 text-gray">{objective}</p>
                            ))}
                        </div>
                    </div>
                    <div className=" flex flex-col gap-2">
                        <h4 className="font-semibold">Activities:</h4>
                        <div className="">
                            {module.activities.map((activity, idx) => (
                                <p key={idx} className="text-sm leading-5 text-gray">{activity}</p>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray">
                        <Clock size={16} className="" />
                        <div className="flex items-center gap-[7px]"><span className="text-neutral-900 font-semibold">Timeline:</span><span>{module.timeline} weeks</span></div>
                    </div>
                    <div className=" flex flex-col gap-2">
                        <h4 className="font-semibold">Resources:</h4>
                        <div className="flex flex-col gap-1">
                            {module.resources.map((resourse) => (
                                <div key={resourse.id} className="">
                                    <Link target="_blank" href={resourse.link} className="link flex items-center   gap-1"><span>{resourse.title}</span> <LinkIcon size={12} /></Link>
                                    <p  className="text-sm leading-5 text-gray">{resourse.description}</p>

                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={()=>mutate()} className="button-blue w-fit">Set to completed</button>
                </div>}
        </div>
    )
}

export default ModuleAccordion