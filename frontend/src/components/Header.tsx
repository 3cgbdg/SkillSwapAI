"use client"

import { api } from "@/api/axiosInstance"
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks"
import { logOut } from "@/redux/authSlice"
import { useMutation } from "@tanstack/react-query"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Banana, Camera, ChartNoAxesCombined, Dumbbell, LayoutDashboard, Menu, Search, UserRound, X } from "lucide-react"


// links for burger menu for  md< screens

const links = [
    { title: "Dashboard", link: "/dashboard", icon: <LayoutDashboard size={30} /> },
    { title: "Workout Plan", link: "/workout-plan", icon: <Dumbbell size={30} /> },
    { title: "Nutrition Plan", link: "/nutrition-plan", icon: <Banana size={30} /> },
    { title: "AI Photo Analysis", link: "/ai-analysis", icon: <Camera size={30} /> },
    { title: "Progress", link: "/progress", icon: <ChartNoAxesCombined size={30} /> },
    { title: "Profile", link: "/profile", icon: <UserRound size={30} /> },
]

const Header = () => {
    const [panel, setPanel] = useState<"menu" | null>(null);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [active, setActive] = useState<boolean>(false);


    const mutation = useMutation({
        mutationFn: async () => await api.delete("/api/auth/logout"),
        onSuccess: () => {
            dispatch(logOut());
            router.push("/auth/login");
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
    useEffect(() => {
        if (active) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [active]);
    return (
        <div className="flex items-center justify-between bg-white py-[14px] px-2 md:px-6 relative ">
            <div className="flex items-center gap-6">
         
                <Link href={"/dashboard"} className="flex items-center group  gap-2 w-fit text-green">

                    <Image className="stroke-darkBlue transition-transform group-hover:-rotate-45" width={32} height={32} src="/logo.png" alt="logo" />

                    <span className={` transiiton-colors relative text-blue group-hover:text-violet  font-dancing_script text-2xl leading-none font-bold `}>SkillSwapAI</span>
                </Link>
            </div>

            <div className="relative flex items-center gap-4">
                <div className="flex items-center gap-2 input">
                <Search/>
                <input type="text" className="outline-0"   placeholder="Search for skills or users..."/>
                </div>
                <button onClick={() => setPanel(panel !== "menu" ? "menu" : null)} className={` cursor-pointer  hover:text-violet hover:border-violet ${panel === "menu" ? "text-violet border-violet" : ""} transition-colors rounded-full overflow-hidden _border flex items-center justify-center p-3`}>
                    {panel !== "menu" ? <UserRound /> : <X />}
                </button>
                {panel &&
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