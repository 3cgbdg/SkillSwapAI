"use client"

import { useAppSelector } from "@/hooks/reduxHooks"
import { Award, Calendar, MessageSquare, Star, User, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { start } from "node:repl";

const Page = () => {
    const { user } = useAppSelector(state => state.auth);
    const { matches } = useAppSelector(state => state.matches);
    const { sessions } = useAppSelector(state => state.sessions);
    const now = new Date();
    return (
        <div className="flex flex-col gap-[33px]">
            <div className="p-8! flex items-center justify-between bg-[#F2F6FDFF] _border rounded-[10px] border-0! shadow-xs!">
                <div className="flex flex-col gap-5 basis-[450px] w-full">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl leading-7 font-medium">Hello, {user?.name}!</h2>
                        <h1 className="text-4xl leading-10 font-extrabold ">Welcome to SkillSwap AI</h1>
                    </div>
                    <p className="text-sm leading-5 text-gray">
                        Your journey to mastering new skills and sharing your expertise starts here. Explore your dashboard for an overview of your progress and matches.
                    </p>
                    <Link href={"/profile"} className="mt-1 button-blue w-fit">View My Profile</Link>
                </div>
                <div className="w-64 aspect-square relative bg-black">
                    <Image src={"/dashboardImage.png"} fill alt="dashboard preview image" />
                </div>
            </div>
            <div className="flex flex-col gap-6">
                <h2 className="section-title ">Your Stats</h2>
                <div className="grid grid-cols-3 gap-6">
                    <div className="h-42 _border rounded-[10px] bg-white py-6! flex items-center flex-col gap-[5px]">
                        <Award size={40} className="text-blue mb-[5px]" />
                        <span className="text-4xl leading-10 font-bold text-blue">{user?.knownSkills ? user?.knownSkills.length : 0}</span>
                        <span className="text-gray leading-7 text-lg">Skills Learned</span>
                    </div>
                    <div className="h-42 _border rounded-[10px] bg-white py-6! flex items-center flex-col gap-[5px]">
                        <Star size={40} className="text-blue mb-[5px]" />
                        <span className="text-4xl leading-10 font-bold text-blue">{user?.completedSessionsCount ?? 0}</span>
                        <span className="text-gray leading-7 text-lg">Sessions Completed</span>
                    </div>
                    <div className="h-42 _border rounded-[10px] bg-white py-6! flex items-center flex-col gap-[5px]">

                        <Users size={40} className="text-blue mb-[5px]" />
                        <span className="text-4xl leading-10 font-bold text-blue">{matches.length}</span>
                        <span className="text-gray leading-7 text-lg">Active Matches</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-6">
                <h2 className="section-title ">Quick Access</h2>
                <div className="grid grid-cols-4 gap-6">
                    <Link href={"/profile"} className="h-33 _border rounded-[10px] bg-white py-6! transition-all hover:opacity-80  flex items-center flex-col gap-5">
                        <User size={40} className="text-orange " />
                        <span className=" leading-7 text-lg font-semibold">My Profile</span>
                    </Link>
                    <Link href={"/matches"} className="h-33 _border rounded-[10px] bg-white py-6! transition-all hover:opacity-80  flex items-center flex-col gap-5">
                        <Users size={40} className="text-orange " />
                        <span className=" leading-7 text-lg font-semibold">Matches</span>
                    </Link>
                    <Link href={"/chats"} className="h-33 _border rounded-[10px] bg-white py-6! transition-all hover:opacity-80  flex items-center flex-col gap-5">
                        <MessageSquare size={40} className="text-orange " />
                        <span className=" leading-7 text-lg font-semibold">Chat</span>
                    </Link>
                    <Link href={"/calendar"} className="h-33 _border rounded-[10px] bg-white py-6! transition-all hover:opacity-80  flex items-center flex-col gap-5">
                        <Calendar size={40} className="text-orange " />
                        <span className=" leading-7 text-lg font-semibold">Calendar</span>
                    </Link>
                </div>
            </div>
            <div className="flex flex-col gap-6">
                <h2 className="section-title">Upcoming Sessions</h2>
                {sessions && sessions.filter(s => {
                    const startDate = new Date();
                    startDate.setHours(s.start, 0, 0, 0);
                    return now <= startDate
                }).map(item => (
                    <div className="_border rounded-xl overflow-hidden flex flex-col">
                        <div className="not-last:border-b-[1px] border-neutral-300 flex justify-between items-center p-4 pt-5">
                            <div className="">
                                <h3 className="text-lg leading-7 font-semibold ">{item.title}</h3>
                                <p className="text-sm leading-5 text-gray">{new Date().toLocaleString()}</p>
                            </div>
                            <button className="mr-4 link">View Details</button>
                        </div>
                    </div>
                    // todo!!!
                ))}

            </div>
        </div>
    )
}

export default Page