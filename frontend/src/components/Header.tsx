"use client"

import { api } from "@/api/axiosInstance"
import { useAppDispatch, } from "@/hooks/reduxHooks"
import { addWantToLearnSkill, logOut } from "@/redux/authSlice"
import {  useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Bell, Check, Handshake, Plus, Search, UserRound, X } from "lucide-react"
import { motion } from "framer-motion";
import { io, Socket } from 'socket.io-client';


// interfaces & types
interface foundUsers {
    id: string,
    name: string,
    isFriend: boolean,
}


interface foundSkills {
    id: string,
    title: string,
}
type Found = foundUsers & foundSkills & {
    name?: string;
    title?: string;
};


interface IRequest {
    id: string,
    fromId: string,
    toId: string,
    from: { name: string },
    to: { name: string }
}


const Header = () => {
    const [panel, setPanel] = useState<"menu" | "search" | "notifs" | null>(null);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [word, setWord] = useState<string>("");
    const [foundUsers, setFoundUsers] = useState<foundUsers[]>([]);
    const [foundSkills, setFoundSkills] = useState<foundSkills[]>([]);
    const queryClient = useQueryClient();
    const [socket, setSocket] = useState<Socket | null>(null);
    const mutation = useMutation({
        mutationFn: async () => await api.delete("/auth/logout"),
        onSuccess: () => {
            dispatch(logOut());
            router.push("/auth/login");
        }
    })
    const { data: reqs } = useQuery({
        queryKey: ['reqs'],
        queryFn: async () => {
            const res = await api.get("/requests");
            return res.data;
        }
    })

    const mutationAddFriend = useMutation({
        mutationFn: async ({ fromId, id }: { fromId: string, id: string }) => { await api.post("/friends", { id: fromId }); return id; },
        onSuccess: (id: string) => {
            queryClient.setQueryData(["reqs"], (old: any) => {
                if (!old) return [];
                return old.filter((req: any) => req.id !== id)
            })
        }

    })

    const mutationSearch = useMutation({
        mutationFn: async (chars: { chars: string }) => { const res = await api.get("/search", { params: chars }); return res.data },
        onSuccess: (data: Found[]) => {
            setFoundUsers(() => data.filter(item => item.name !== undefined));
            setFoundSkills(() => data.filter(item => item.title !== undefined));
        }
    })

    // adding skill (want to learn)

    const mutationAddLearn = useMutation({
        mutationFn: async (str: string) => api.post("/skills/want-to-learn", { title: str }),
    })
    const mutationCreateFriendRequest = useMutation({
        mutationFn: async (str: string) => api.post("/requests", { id: str }),
    })


    useEffect(() => {
        const sock = io(`${process.env.NEXT_PUBLIC_API_URL}`, { withCredentials: true });
        setSocket(sock);
        return () => { sock.disconnect() };
    }, [])

    useEffect(() => {
        if (socket) {
            socket.on('connect', () => { });
            socket.on('friendRequest', (payload) => {
                queryClient.setQueryData(['reqs'], (old: any) => {
                    return [...old, payload.request]
                })
            })
            return () => {
                socket.off("friendRequest");
            };
        }

    }, [socket])


    return (
        <div className="flex items-center justify-between bg-white py-[14px] px-2 md:px-6 relative ">
            <div className="flex items-center gap-6">

                <Link href={"/dashboard"} className="flex items-center group  gap-2 w-fit text-green">

                    <Image className="stroke-darkBlue transition-transform group-hover:-rotate-45" width={32} height={32} src="/logo.png" alt="logo" />

                    <span className={` transiiton-colors relative text-blue group-hover:text-violet  font-dancing_script text-2xl leading-none font-bold `}>SkillSwapAI</span>
                </Link>
            </div>

            <div className="relative flex items-center gap-4">
                {/* search*/}



                <div className="flex items-center gap-2 input">
                    {panel === "search" ? (<button className={`cursor-pointer flex items-center ${panel === "search" ? "text-primary" : ""} `} onClick={() => { setPanel(null); setWord(""); }}> <X /></button>
                    ) : (<button className={`  cursor-pointer flex items-center    transition-all hover:text-primary  `} onClick={() => {


                    }}><Search /></button>)}

                    <input value={word} onChange={async (e) => {

                        setWord(e.target.value);

                        if (e.target.value.length > 2) {
                            await mutationSearch.mutate({ chars: e.target.value });
                            setPanel("search");
                            console.log(foundUsers)
                        }else{
                            setPanel(null)
                        }

                    }}
                        type="text"
                        className="outline-0" placeholder="Search for skills or users..."
                    />

                    {panel === "search" ? <div className="min-w-[250px] flex flex-col top-full panel bg-white z-10  left-0 absolute _border mt-1  bg-primary  p-3  rounded-[6px]">
                        <div className="flex flex-col gap-4 items-start text-sm font-semibold">
                            {foundSkills.length > 0 &&
                                <div className="flex flex-col gap-2 pb-4 not-last:border-b-[1px] border-neutral-300 w-full">
                                    <h3 className="text-lg leading-7 font-medium">Skills</h3>
                                    <div className="flex flex-col gap-1  border-neutral-300">
                                        {foundSkills.map((skill, index) => {
                                            return (
                                                <div key={index} className="flex gap-2 items-center">
                                                    <div className="  w-fit _border p-1 rounded-xl transition-all" >{skill.title}</div>

                                                    <button onClick={() => { mutationAddLearn.mutate(skill.title); dispatch(addWantToLearnSkill(skill.title));setFoundSkills(prev=>prev.filter(item=>item.id!==skill.id)) }} className="btn  w-fit _border p-1 rounded-xl cursor-pointer transition-all hover:bg-green-400 outline-0" ><Plus size={20} /></button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            }
                            {foundUsers.length > 0 &&
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-lg leading-7 font-semibold">Users</h3>
                                    <div className="flex flex-col  gap-1  border-neutral-300">
                                        {foundUsers.map((user, index) => {
                                            return (
                                                <div key={index} className="flex gap-2 items-center">
                                                    <Link href={`/profiles/${user.id}`} className="btn  w-fit _border p-1 rounded-xl transition-all hover:bg-blue-200 outline-0" >{user.name}</Link>
                                                    {!user.isFriend ? <button onClick={() => mutationCreateFriendRequest.mutate(user.id)} className="btn cursor-pointer  w-fit _border p-1 rounded-xl transition-all hover:bg-green-400 outline-0" ><Handshake size={20} /></button>
                                                        :
                                                        <span className="text-green-400">Friend</span>
                                                        }
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            }

                            {foundSkills.length == 0 && foundUsers.length == 0 && <span className="">Not found!</span>}
                        </div>
                    </div>
                        : ""}



                </div>
                {/* notifs */}
                <div className="relative">
                    <motion.button onClick={() => setPanel(panel !== "notifs" ? "notifs" : null)} className="hover:text-blue relative transition-colors cursor-pointer"
                        whileHover={{ rotate: [0, 15, -10, 5, -5, 0] }}
                        transition={{ duration: 0.5 }}
                    >
                        <Bell size={32} />
                        <span className="rounded-full p-1 px-2 text-white font-semibold text-xs bg-blue absolute -top-2 -right-2">{(reqs as IRequest[])?.length}</span>
                    </motion.button>

                    {/* notifs list */}
                    {panel == "notifs" &&
                        <div className="">
                            <div className="_border mt-2 rounded-md p-3 absolute top-full bg-white panel right-0 min-w-[250px] flex flex-col gap-2">
                                {reqs.length > 0 ?  (
                                    <div className="flex flex-col gap-2 pb-4 not-last:border-b-[1px] border-neutral-300 w-full">
                                        <h3 className="text-lg leading-7 font-medium">Friends Requests🧑‍🦰</h3>
                                        <div className="flex flex-col gap-1  border-neutral-300 max-h-[450px] overflow-x-auto">
                                            {reqs && (reqs as IRequest[]).map((req, index) => {
                                                console.log(req)
                                                return (
                                                    <div key={index} className="flex gap-2 w-full _border p-2 flex-col">
                                                        <div className="flex items-center justify-between">
                                                            <div className="     rounded-xl transition-all" >{req.from?.name}</div>
                                                            <button onClick={() => mutationAddFriend.mutate({ fromId: req.fromId, id: req.id })} className="button-transparent"><Check size={16} /></button>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ) : <span className="text-sm leading-5">No notifications</span>}
                            </div>
                        </div>}
                </div>


                <button onClick={() => setPanel(panel !== "menu" ? "menu" : null)} className={` cursor-pointer  hover:text-violet hover:border-violet ${panel === "menu" ? "text-violet border-violet" : ""} transition-colors rounded-full overflow-hidden _border flex items-center justify-center p-3`}>
                    {panel !== "menu" ? <UserRound /> : <X />}
                </button>
                {panel == "menu" &&
                    <div className=" absolute min-w-[250px] right-0 top-[140%] panel">
                        <div className="_border  rounded-lg p-5 bg-white">
                            <h3 className="font-semibold pb-1 border-b mb-2">Profile</h3>
                            <div className="flex flex-col gap-4 items-start">
                                <button className="link" onClick={() => mutation.mutate()}>Log out</button>

                            </div>
                        </div>
                    </div>
                }
            </div>

        </div>
    )
}

export default Header