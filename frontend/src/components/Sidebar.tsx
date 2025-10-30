"use client"

import { Calendar,LayoutDashboard, Menu, MessageSquare, User, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const links = [
    { title: "Dashboard", link: "/dashboard", icon: <LayoutDashboard /> },
    { title: "Matches", link: "/matches", icon: <Users /> },
    { title: "Chat", link: "/chats", icon: <MessageSquare /> },
    { title: "Calendar", link: "/calendar", icon: <Calendar/> },
    { title: "My Profile", link: "/profile", icon: <User /> },
]

const Sidebar = () => {
    const path = usePathname();
    const [active, setActive] = useState<boolean>(false);

    return (
        <div className={`lg:basis-[254px] hidden md:block ${active ? "basis-[254px] " : ""} shrink-0 relative overflow-hidden  _border border-t-0! h-full bg-white`}>

            <button onClick={() => setActive(!active)} className={`p-3 cursor-pointer w-full  hover:text-green ${active && "bg-blue text-green"} transition-colors flex justify-center hover:bg-blue border-b-[1px] border-b-neutral-600 lg:hidden!`}>
                <Menu />
            </button>
            <div className={`p-2 ${active ? " left-0 " : " -left-[500px]"} transition-all absolute lg:left-0 flex flex-col gap-1  w-[254px] lg:w-full lg:relative`}>
                {links.map(item => (
                    <Link key={item.link} href={item.link} className={`p-2   flex items-center gap-2 text-sm leading-5.5 font-medium text-neutral-600 rounded-lg  ${item.link === path ? "text-neutral-900 font-semibold bg-blue-300" : " "} `}>{item.icon} {item.title}</Link>
                ))}
            </div>
        </div>
    )
}

export default Sidebar