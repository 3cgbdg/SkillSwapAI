"use client"

import { api } from "@/api/axiosInstance";
import AddSkills from "@/components/profile/AddSkills";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks"
import { useMutation } from "@tanstack/react-query";
import { GraduationCap, Pencil,} from "lucide-react"
import Link from "next/link";

const Page = () => {
    const { user } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
 
    return (
        <div className="flex flex-col gap-8">
            <div className="_border p-8 flex items-start gap-6 rounded-2xl">
                <div className="rounded-full bg-black size-24">
                </div>
                <div className="flex flex-col gap-[10px] basis-[520px] w-full">
                    <h1 className="text-3xl leading-9.5 font-bold ">{user?.name}</h1>
                    <p className="text-gray">Passionate full-stack developer and aspiring musician. Love building innovative tech solutions and exploring creative outlets.</p>
                    <b className="button-transparent mt-1 rounded-md! w-fit items-center gap-3">
                        <Pencil size={18} />
                        Edit Profile
                    </b>
                </div>

            </div>
            <AddSkills />
            <div className="_border rounded-2xl px-6 py-5.5">
                <h2 className="text-2xl leading-6 font-bold mb-4">
                    AI Skill Suggestions
                </h2>
                <div className="flex flex-col gap-4">
                    <div className="not-last:border-b py-3 border-b-neutral-300">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-4 items-center">
                                <div className="size-10 overflow-hidden rounded-full bg-[#3A7AE933] flex items-center justify-center">
                                    <GraduationCap className="text-blue " size={20} />
                                </div>
                                <div className="">
                                    <h3 className="leading-7 text-lg font-semibold">
                                        a Skill
                                    </h3>
                                    <p className="text-sm leading-5 text-gray">Description about a skill</p>
                                </div>
                            </div>
                            <div className="link">Add to Learn</div>
                        </div>
                    </div>
                    <div className="not-last:border-b py-3 border-b-neutral-300">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-4 items-center">
                                <div className="size-10 overflow-hidden rounded-full bg-[#3A7AE933] flex items-center justify-center">
                                    <GraduationCap className="text-blue " size={20} />
                                </div>
                                <div className="">
                                    <h3 className="leading-7 text-lg font-semibold">
                                        a Skill
                                    </h3>
                                    <p className="text-sm leading-5 text-gray">Description about a skill</p>
                                </div>
                            </div>
                            <div className="link">Add to Learn</div>
                        </div>
                    </div>
                    <div className="not-last:border-b py-3 border-b-neutral-300">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-4 items-center">
                                <div className="size-10 overflow-hidden rounded-full bg-[#3A7AE933] flex items-center justify-center">
                                    <GraduationCap className="text-blue " size={20} />
                                </div>
                                <div className="">
                                    <h3 className="leading-7 text-lg font-semibold">
                                        a Skill
                                    </h3>
                                    <p className="text-sm leading-5 text-gray">Description about a skill</p>
                                </div>
                            </div>
                            <div className="link">Add to Learn</div>
                        </div>
                    </div>
                    <div className="not-last:border-b py-3 border-b-neutral-300">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-4 items-center">
                                <div className="size-10 overflow-hidden rounded-full bg-[#3A7AE933] flex items-center justify-center">
                                    <GraduationCap className="text-blue " size={20} />
                                </div>
                                <div className="">
                                    <h3 className="leading-7 text-lg font-semibold">
                                        a Skill
                                    </h3>
                                    <p className="text-sm leading-5 text-gray">Description about a skill</p>
                                </div>
                            </div>
                            <div className="link">Add to Learn</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="_border rounded-2xl px-6 py-5.5">
                <h2 className="text-2xl leading-6 font-bold mb-4">
                    AI User Suggestions
                </h2>
                <div className="flex flex-col gap-4">
                    <div className="not-last:border-b py-3 border-b-neutral-300">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-4 items-center">
                                <div className="size-10 overflow-hidden rounded-full  bg-[#3A7AE933] flex items-center justify-center">

                                </div>
                                <div className="">
                                    <h3 className="leading-7 text-lg font-semibold">
                                        Emily Chen
                                    </h3>
                                    <p className="text-sm leading-5 text-gray">Expert in Machine Learning & Data Science</p>
                                </div>
                            </div>
                            <Link href={"/profile"} className="link">View Profile</Link>
                        </div>
                    </div>


                </div>
            </div>
        </div>

    )
}

export default Page