"use client"

import PlansService from "@/services/PlansService";
import { IGeneratedModule } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Clock, Link as LinkIcon } from "lucide-react"
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react"
import { toast } from "react-toastify";

const ModuleAccordion = ({ module, setIsActive, isActive, idx, planId }: { planId: string, module: IGeneratedModule, isActive: null | number, idx: number, setIsActive: Dispatch<SetStateAction<null | number>> }) => {
    const { id } = useParams() as { id: string };
    const queryClient = useQueryClient();
    const router = useRouter();
    const { mutate: setModuleStatusToCompleted } = useMutation({
        mutationFn: async () => {
            const res = await PlansService.setModuleStatusToCompleted(planId, module.id);
            return res;
        },
        onSuccess: (data) => {
            toast.success(data.message);
            if (data.status !== null) {
                router.push("/dashboard");
            }
            queryClient.invalidateQueries({ queryKey: ['matches', id] })
        },
        onError: (err) => {
            toast.error(err.message);
        }
    })
    return (
        <div className="bg-neutral-100 flex flex-col _border rounded-[10px] p-4 min-h-[94px]">
            <div className="w-full flex flex-row justify-between items-start gap-2 sm:items-center sm:h-auto h-auto my-2">
                <div className=" flex flex-col gap-2 sm:gap-4 max-w-[280px] sm:max-w-[450px]">
                    <div className="flex items-start sm:items-center gap-2 sm:gap-4">
                        <input disabled checked={module.status !== 'INPROGRESS'} readOnly className="size-4 mt-1 sm:mt-0 flex-shrink-0" type="checkbox" />
                        <h3 className="text-sm sm:text-lg leading-5 sm:leading-7 font-semibold break-words">{module.title}</h3>
                    </div>
                    <div className={`p-1 text-xs sm:text-sm font-medium block sm:hidden w-fit text-white rounded-xl ${module.status != 'INPROGRESS' ? 'bg-blue ' : 'bg-neutral-200 text-gray!'}`}>{module.status != 'INPROGRESS' ? 'Completed' : 'In Progress'}</div>
                </div>
                <div className="flex items-center gap-10">
                    <div className={`p-1 text-sm font-medium sm:block hidden text-white rounded-xl ${module.status != 'INPROGRESS' ? 'bg-blue ' : 'bg-neutral-200 text-gray!'}`}>{module.status != 'INPROGRESS' ? 'Completed' : 'In Progress'}</div>
                    <button onClick={() => setIsActive(isActive == idx ? null : idx)} className={`${isActive == idx ? 'rotate-180' : ''} hover:shadow-2xs p-1 rounded-4xl  cursor-pointer transition-all`}>
                        <ChevronDown />
                    </button>
                </div>
            </div>
            {isActive == idx &&
                <div className={`h-fit flex  flex-col gap-4 p-4`}>
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
                                    <p className="text-sm leading-5 text-gray">{resourse.description}</p>

                                </div>
                            ))}
                        </div>
                    </div>
                    {
                        module.status == 'INPROGRESS' &&
                        <button onClick={() => setModuleStatusToCompleted()} className="button-blue w-fit">Set to completed</button>

                    }
                </div>}
        </div >
    )
}

export default ModuleAccordion