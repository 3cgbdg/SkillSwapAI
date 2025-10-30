"use client"

import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { addKnownSkill, addWantToLearnSkill, deleteKnownSkill, deleteWantToLearnSkill } from "@/redux/authSlice";
import SkillsService from "@/services/SkillsService";
import { useMutation } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";



const AddSkills = () => {
    const [wantToLearnInput, setWantToLearnInput] = useState<string>("");
    const [knownInput, setKnownInput] = useState<string>("");
    const { user } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
    const [availableSkills, setAvailableSkills] = useState<{ id: string, title: string }[]>([]);

    // for chars searching skills
    const availableMutation = useMutation({
        mutationFn: async ({ data }: { data: string }) => SkillsService.getSkills(data),
        onSuccess: (data: { id: string, title: string }[]) => setAvailableSkills(data),
    })

    // adding skill (known)
    const mutationAddKnown = useMutation({
        mutationFn: async (str: string) => SkillsService.addKnownSkill(str),
    })

    // adding skill (want to learn)

    const mutationAddLearn = useMutation({
        mutationFn: async (str: string) => SkillsService.addWantToLearnSkill(str),
    })
    // deleting skill (known)

    const mutationDeleteKnown = useMutation({
        mutationFn: async (str: string) => SkillsService.deleteKnownSkill(str),
    })
    // deleting skill (want to learn)

    const mutationDeleteLearn = useMutation({
        mutationFn: async (str: string) => SkillsService.deleteWantToLearnSkill(str),
    })
    // input ref
    const ref1 = useRef<HTMLInputElement>(null);
    return (
        <div className="grid grid-cols-2 gap-8">
            {/* for known skills */}
            <div className="_border p-6 pt-[21px] rounded-2xl">
                <h2 className="text-2xl leading-6 font-bold mb-4">Skills I Know</h2>
                <div className="flex gap-2 flex-wrap mb-6">
                    {user?.knownSkills && user?.knownSkills?.length > 0 ? user.knownSkills.map((skill, idx) => (
                        <div key={idx} className="bg-blue text-sm leading-5 font-medium flex w-fit gap-2 px-3.5 text-white py-2 items-center rounded-2xl">
                            {skill.title}
                            <button onClick={() => {
                                dispatch(deleteKnownSkill(skill.title))
                                mutationDeleteKnown.mutate(skill.title);
                            }} className="outline-0hover:text-darkBlue cursor-pointer transition-all" ><X size={14} /></button>
                        </div>
                    )) :
                        <span className="font-medium  leading-5 " >No skills yet</span>}
                </div>
                <div className="flex items-center gap-2 relative">
                    <input ref={ref1} onChange={(e) => { setKnownInput(e.target.value); if (e.target.value.length > 2) availableMutation.mutate({ data: e.target.value }) }} placeholder="Add a skill you know..." type="text" className="input basis-full" />
                    <button onClick={() => {
                        dispatch(addKnownSkill(knownInput));
                        mutationAddKnown.mutate(knownInput);
                        if (ref1.current)
                            ref1.current.value = ""
                        setKnownInput("");
                    }} className="button-blue">
                        <Plus />
                    </button>
                    {knownInput.length > 2 &&
                        <div className="absolute top-full left-0">
                            <div className="mt-1 input p-2  min-w-[150px] max-w-[350px] flex gap-1 flex-wrap bg-white">
                                {availableSkills.length > 0 ? <div className="flex flex-col gap-1">
                                    {availableSkills.map((skill, idx) => (
                                        <button type="button" onClick={() => {
                                            dispatch(addKnownSkill(skill.title)); mutationAddKnown.mutate(skill.title);
                                            if (ref1.current)
                                                ref1.current.value = ""
                                            setKnownInput("");
                                        }} key={idx} className="input text-sm! cursor-pointer leading-5! font-medium transition-colors hover:bg-violet">
                                            {skill.title}
                                        </button>
                                    ))}
                                </div> :
                                    <span className="text-sm leading-5 text-gray">Empty</span>
                                }
                            </div>
                        </div>
                    }
                </div>
            </div>

            {/* for want-to-learn skills */}
            <div className="_border p-6 pt-[21px] rounded-2xl">
                <h2 className="text-2xl leading-6 font-bold mb-4">Skills I Want to Learn</h2>
                <div className="flex gap-2 flex-wrap mb-6">
                    {user?.skillsToLearn && user?.skillsToLearn?.length > 0 ? user.skillsToLearn.map((skill, idx) => (
                        <div key={idx} className="bg-blue text-sm leading-5 font-medium flex w-fit gap-2 px-3.5 text-white py-2 items-center rounded-2xl">
                            {skill.title}
                            <button onClick={() => {
                                dispatch(deleteWantToLearnSkill(skill.title))
                                mutationDeleteLearn.mutate(skill.title);
                            }} className="outline-0hover:text-darkBlue cursor-pointer transition-all" ><X size={14} /></button>
                        </div>
                    )) :
                        <span className="font-medium  leading-5 " >No skills yet</span>}
                </div>
                <div className="flex items-center gap-2 relative">
                    <input ref={ref1} onChange={(e) => { setWantToLearnInput(e.target.value); if (e.target.value.length > 2) availableMutation.mutate({ data: e.target.value }) }} placeholder="Add a skill you want to learn..." type="text" className="input basis-full" />
                    <button onClick={() => {
                        dispatch(addWantToLearnSkill(wantToLearnInput));
                        mutationAddLearn.mutate(wantToLearnInput);
                        if (ref1.current)
                            ref1.current.value = ""
                        setWantToLearnInput("");
                    }} className="button-blue">
                        <Plus />
                    </button>
                    {wantToLearnInput.length > 2 &&
                        <div className="absolute top-full left-0">
                            <div className="mt-1 input p-2  min-w-[150px] max-w-[350px] flex gap-1 flex-wrap bg-white">
                                {availableSkills.length > 0 ? <div className="flex flex-col gap-1">
                                    {availableSkills.map((skill, idx) => (
                                        <button type="button" onClick={() => {
                                            dispatch(addWantToLearnSkill(skill.title)); mutationAddLearn.mutate(skill.title);
                                            if (ref1.current)
                                                ref1.current.value = ""
                                            setWantToLearnInput("");
                                        }} key={idx} className="input text-sm! cursor-pointer leading-5! font-medium transition-colors hover:bg-violet">
                                            {skill.title}
                                        </button>
                                    ))}
                                </div> :
                                    <span className="text-sm leading-5 text-gray">Empty</span>
                                }
                            </div>
                        </div>
                    }
                </div>
            </div>


        </div>
    )
}

export default AddSkills