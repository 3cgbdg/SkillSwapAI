"use client"

import { api } from "@/api/axiosInstance"
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks"
import { logOut } from "@/redux/authSlice"
import { useMutation } from "@tanstack/react-query"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Banana, Camera, ChartNoAxesCombined, Dumbbell, Handshake, LayoutDashboard, Menu, Plus, Search, UserRound, X } from "lucide-react"


// links for burger menu for  md< screens

const links = [
    { title: "Dashboard", link: "/dashboard", icon: <LayoutDashboard size={30} /> },
    { title: "Workout Plan", link: "/workout-plan", icon: <Dumbbell size={30} /> },
    { title: "Nutrition Plan", link: "/nutrition-plan", icon: <Banana size={30} /> },
    { title: "AI Photo Analysis", link: "/ai-analysis", icon: <Camera size={30} /> },
    { title: "Progress", link: "/progress", icon: <ChartNoAxesCombined size={30} /> },
    { title: "Profile", link: "/profile", icon: <UserRound size={30} /> },
]
interface foundUsers {
    id: string,
    name: string,
}


interface foundSkills {
    id: string,
    title: string,
}
type Found = foundUsers & foundSkills & {
    name?: string;
    title?: string;
};
const Header = () => {
    const [panel, setPanel] = useState<"menu" | "search" | null>(null);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [word, setWord] = useState<string>("");
    const [foundUsers, setFoundUsers] = useState<foundUsers[]>([]);
    const [foundSkills, setFoundSkills] = useState<foundSkills[]>([]);
    const mutation = useMutation({
        mutationFn: async () => await api.delete("/auth/logout"),
        onSuccess: () => {
            dispatch(logOut());
            router.push("/auth/login");
        }
    })

    const mutationSearch = useMutation({
        mutationFn: async (chars: { chars: string }) => { const res = await api.get("/search", { params: chars }); return res.data },
        onSuccess: (data: Found[]) => {
            setFoundUsers(() => data.filter(item => item.name !== undefined));
            setFoundSkills(() => data.filter(item => item.title !== undefined));
        }
    })
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            if (!target.closest(".panel")) {
                setPanel(null);
            }
        };

        if (panel) {
            document.addEventListener("click", handleClickOutside);
        }

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [panel]);
    // useEffect(() => {
    //     if (active) {
    //         document.body.style.overflow = "hidden";
    //     } else {
    //         document.body.style.overflow = "auto";
    //     }

    //     return () => {
    //         document.body.style.overflow = "auto";
    //     };
    // }, [active]);
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

                        }

                    }}
                        type="text"
                        className="outline-0" placeholder="Search for skills or users..."
                    />

                    {panel === "search" ? <div className="min-w-[250px] flex flex-col top-full panel bg-white  left-0 absolute _border mt-1  bg-primary  p-3  rounded-[6px]">
                        <div className="flex flex-col gap-4 items-start text-sm font-semibold">
                            {foundSkills.length > 0 &&
                                <div className="flex flex-col gap-2 pb-4 not-last:border-b-[1px] border-neutral-300 w-full">
                                    <h3 className="text-lg leading-7 font-medium">Skills</h3>
                                    <div className="flex flex-col gap-1  border-neutral-300">
                                        {foundSkills.map((skill, index) => {
                                            return (
                                                <div key={index} className="flex gap-2 items-center">
                                                    <Link href={"#"} className="btn  w-fit _border p-1 rounded-xl transition-all hover:bg-blue-200 outline-0" >{skill.title}</Link>
                                                    <button className="btn  w-fit _border p-1 rounded-xl transition-all hover:bg-green-400 outline-0" ><Plus size={20} /></button>
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
                                                    <Link href={"#"} className="btn  w-fit _border p-1 rounded-xl transition-all hover:bg-blue-200 outline-0" >{user.name}</Link>
                                                    <button className="btn  w-fit _border p-1 rounded-xl transition-all hover:bg-green-400 outline-0" ><Handshake size={20} /></button>
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