"use client"

import { api } from "@/api/axiosInstance"
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks"
import { logOut } from "@/redux/authSlice"
import { useMutation } from "@tanstack/react-query"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Banana, Camera, ChartNoAxesCombined, Dumbbell, LayoutDashboard, Menu, UserRound, X } from "lucide-react"


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
    const { measurements } = useAppSelector(state => state.measurements)
    return (
        <div className="flex items-center justify-between bg-white py-[14px] px-2 md:px-6 relative">
            <div className="flex items-center gap-6">
                {/* burger btn */}
                <button onClick={() => setActive(!active)} className={` cursor-pointer  block md:hidden  hover:text-green ${active && "bg-[#F5FAF5FF] text-green"} transition-colors hover:bg-[#F5FAF5FF]  lg:hidden`}>
                    {!active ? <Menu size={30} /> : <X size={30} />}
                </button>
                {/* fixed menu  */}
                <div className={`fixed w-full md:hidden transition-all h-full z-100 top-[70px] p-3 ${active ? "right-0" : "right-500"} bg-green  `}>
                    {links.map(item => (
                        <Link onClick={() => setActive(false)} key={item.link} href={item.link} className={`p-2 ${!measurements && !["Dashboard", "Profile", "AI Photo Analysis"].includes(item.title) && "pointer-events-none bg-neutral-300 text-neutral-500!"}   flex items-center gap-2 section-title border-b-[2px]   `}>{item.icon} {item.title}</Link>
                    ))}
                </div>
                <Link href={"/dashboard"} className="flex items-center group hover:text-[#468438FF] gap-1 w-fit hover: text-green">

                    <Image className="stroke-black transition-transform group-hover:rotate-90" width={32} height={32} src="/logo.svg" alt="logo" />

                    <span className={` transiiton-colors relative top-2 font-borel text-2xl leading-none font-bold `}>Trainix</span>
                </Link>
            </div>

            <div className="relative">
                <button onClick={() => setPanel(panel !== "menu" ? "menu" : null)} className={` cursor-pointer  hover:text-[#468438FF] hover:border-[#468438FF] ${panel === "menu" ? "text-[#468438FF] border-[#468438FF]" : ""} transition-colors rounded-full overflow-hidden _border flex items-center justify-center p-2`}>
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