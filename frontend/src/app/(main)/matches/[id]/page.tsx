"use client"

import { api } from "@/api/axiosInstance";
import ModuleAccordion from "@/components/matches/ModuleAccordion";
import Spinner from "@/components/Spinner";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { updateChats } from "@/redux/chatsSlice";
import { IChat, IMatch } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { Calendar, MessageSquareMore } from "lucide-react";
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react";

const Page = () => {
    const { id } = useParams() as { id: string };
    const { matches } = useAppSelector(state => state.matches);
    const [currentMatch, setCurrentMatch] = useState<IMatch | null>(null);
    const router = useRouter();
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (!matches || matches.length == 0) return;
        const match = matches.find(item => item.id == id);
        console.log(match)
        setCurrentMatch(match ?? null);
        if (!match) {
            router.push('/404');
        }
    }, [matches])

    // for getting 
    const { mutate: createChat } = useMutation({
        mutationFn: async ({ payload }: { payload: { friendId: string, friendName: string } }) => { const res = await api.post("/chats", payload); return res.data },
        onSuccess: (data: IChat) => {
            router.push(`/chats/${data.chatId}`);
            dispatch(updateChats(data));
        }
    })

    // mutation for generating plan
    const {mutate:generatePlan} = useMutation({
        mutationFn:async()=>{
            const res = await api.post('/matches/plan');

        }
    })

    return (<>
        {currentMatch ?
            <div className="flex flex-col gap-8">
                <div className="grid gap-8 grid-cols-3">
                    <div className="_border rounded-[10px] col-span-2 banner_gradient flex flex-col gap-4  p-8">
                        <div className="flex flex-col gap-2">
                            <h1 className="page-title">Your AI-Powered Training Plan with Alex Rivera</h1>
                            <p className="text-lg leading-7 ">Mastering Advanced JavaScript</p>
                        </div>
                        <div className="">
                            {currentMatch.aiExplanation}
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-xl leading-7 font-semibold">Benefits:</h3>
                            <ol className="list-disc">
                                <li>{currentMatch.keyBenefits[0]}</li>
                                <li>{currentMatch.keyBenefits[1]}</li>
                                <li>{currentMatch.keyBenefits[2]}</li>
                                <li>{currentMatch.keyBenefits[3]}</li>
                            </ol>
                        </div>
                    </div>
                    <div className="_border rounded-[10px] col-span-1 p-6">
                        <div className="flex flex-col gap-4 items-center">
                            <div className="size-24 rounded-full bg-black"></div>
                            <h2 className="section-title">{currentMatch.other.name}</h2>
                            <div className="flex flex-col gap-3 mt-4 w-full">
                                <button onClick={() => createChat({ payload: { friendId: id, friendName: currentMatch.other.name } })} className="button-blue flex items-center gap-5">
                                    <MessageSquareMore size={20} />
                                    <span>Message {currentMatch.other.name}</span>
                                </button>
                                <button className="button-transparent rounded-md! flex items-center gap-5">
                                    <Calendar size={20} />
                                    <span>Schedule Session</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid gap-8 grid-cols-3 ">
                    <div className="_border col-span-2 rounded-[10px] p-6 h-[254px] flex items-center justify-center text-center">
                        <div className="flex flex-col gap-4 items-center">
                            <div className="flex flex-col  gap-1.5">
                                <h2 className="section-title">Overall Progress</h2>
                                <p className="tex-sm leading-5 text-gray">Your AI-generated training journey</p>
                            </div>
                            <button onClick={()=>generatePlan()} className="button-transparent">sdad</button>
                        </div>
                    </div>
                </div>
                <div className="w-full _border rounded-[10px] p-6">
                    <div className="flex flex-col gap-2 mb-6">
                        <h2 className="page-title">Training Modules</h2>
                        <p className="text-sm leading-5 text-gray">Breakdown of your skill exchange journey</p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <ModuleAccordion/>
                        {/* { accordion map} */}
                    </div>
                </div>
            </div>

            : <div className="h-100 flex items-center justify-center"><Spinner color='blue' size={44} /></div>
        }
    </>
    )
}

export default Page