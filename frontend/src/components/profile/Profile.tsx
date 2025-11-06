"use client"
import AddSkills from "@/components/profile/AddSkills";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { addAiSuggestionSkills, addWantToLearnSkill } from "@/redux/authSlice";
import AiService from "@/services/AiService";
import SkillsService from "@/services/SkillsService";
import { useMutation } from "@tanstack/react-query";
import { GraduationCap, Pencil, UserRound, } from "lucide-react"
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import Spinner from "../Spinner";
const Profile = ({ setIsEditing }: { setIsEditing: Dispatch<SetStateAction<boolean>> }) => {
    const { user } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
    const { mutate: addNewSkillToLearn } = useMutation({
        mutationFn: async (title: string) => {
            await SkillsService.addWantToLearnSkill(title);
            dispatch(addWantToLearnSkill(title));
        },
    })

    const { mutate: getNewAiSuggestionSkills, isPending } = useMutation({
        mutationFn: async () => {
            const skills = await AiService.getNewAiSuggestionSkills();
            if (skills)
                dispatch(addAiSuggestionSkills(skills));
        },
    })
    return (
        <>
            {user &&
                <div className="flex flex-col gap-8">
                    <div className="_border p-8 flex items-start gap-6 rounded-2xl">
                        <div className="w-[96px] h-[96px] flex items-center justify-center _border rounded-full overflow-hidden relative">
                            {
                                user.imageUrl ?
                                    <Image className=" object-cover" src={user.imageUrl} fill alt="user image" /> :
                                    <UserRound size={48} />
                            }
                        </div>
                        <div className="flex flex-col gap-[10px] basis-[520px] w-full">
                            <h1 className="text-3xl leading-9.5 font-bold ">{user?.name}</h1>
                            <p className="text-gray">Passionate full-stack developer and aspiring musician. Love building innovative tech solutions and exploring creative outlets.</p>
                            <button onClick={() => setIsEditing(true)} className="button-transparent mt-1 rounded-md! w-fit items-center gap-3">
                                <Pencil size={18} />
                                Edit Profile
                            </button>
                        </div>

                    </div>
                    <AddSkills />
                    <div className="_border rounded-2xl px-6 py-5.5">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-2xl leading-6 font-bold mb-4">
                                AI Skill Suggestions
                            </h2>
                            <button onClick={() => getNewAiSuggestionSkills()} className="button-blue">Regenerate AI Skills Suggestions</button>
                        </div>
                        <div className="flex flex-col gap-4">
                            {!isPending ?
                                user.aiSuggestionSkills.map((skill, idx) => (
                                    <div key={idx} className="not-last:border-b py-3 border-b-neutral-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-4 items-center">
                                                <div className="size-10 overflow-hidden rounded-full bg-[#3A7AE933] flex items-center justify-center">
                                                    <GraduationCap className="text-blue " size={20} />
                                                </div>
                                                <div className="">
                                                    <h3 className="leading-7 text-lg font-semibold">
                                                        {skill}
                                                    </h3>
                                                </div>
                                            </div>
                                            <button onClick={() => addNewSkillToLearn(skill)} className="link">Add to Learn</button>
                                        </div>
                                    </div>
                                )) :
                                <Spinner color="blue" size={32} />
                            }
                        </div>
                    </div>
                </div >
            }
        </>

    )
}

export default Profile