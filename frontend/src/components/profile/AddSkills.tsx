"use client"

import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { addKnownSkill, addWantToLearnSkill, deleteKnownSkill, deleteWantToLearnSkill } from "@/redux/authSlice";
import SkillsService from "@/services/SkillsService";
import { useMutation } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "react-toastify";



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
        onError: (err) => {
            toast.error(err.message);
        }
    })

    // adding skill (known)
    const mutationAddKnown = useMutation({
        mutationFn: async (str: string) => SkillsService.addKnownSkill(str),
        onError: (err) => {
            toast.error(err.message)
        }
    })

    // adding skill (want to learn)

    const mutationAddLearn = useMutation({
        mutationFn: async (str: string) => SkillsService.addWantToLearnSkill(str),
        onError: (err) => {
            toast.error(err.message)
        }
    })
    // deleting skill (known)

    const mutationDeleteKnown = useMutation({
        mutationFn: async (str: string) => SkillsService.deleteKnownSkill(str),
        onError: (err) => {
            toast.error(err.message)
        }
    })
    // deleting skill (want to learn)

    const mutationDeleteLearn = useMutation({
        mutationFn: async (str: string) => SkillsService.deleteWantToLearnSkill(str),
        onError: (err) => {
            toast.error(err.message)
        }
    })
    // input ref
    const knownRef = useRef<HTMLInputElement>(null);
    const learnRef = useRef<HTMLInputElement>(null);
    return (
        <div className="grid md:grid-cols-2 gap-8">
            {/* for known skills */}
            <div className="_border p-6 pt-[21px] rounded-2xl flex flex-col">
                <h2 className="text-2xl leading-6 font-bold mb-4">Skills I Know</h2>
                <div className="basis-full">
                    <div className="flex gap-2 flex-wrap mb-6 overflow-y-auto   max-h-[170px] ">

                        {user?.knownSkills && user?.knownSkills?.length > 0 ? user.knownSkills.map((skill, idx) => (
                            <div key={idx} className="bg-blue text-sm leading-5 font-medium h-fit flex w-fit gap-2 px-3.5 text-white py-2 items-center rounded-2xl">
                                {skill.title}
                                <button onClick={() => {
                                    dispatch(deleteKnownSkill(skill.title))
                                    mutationDeleteKnown.mutate(skill.title);
                                }} className="outline-0hover:text-darkBlue cursor-pointer transition-all" ><X size={14} /></button>
                            </div>
                        )) :
                            <span className="font-medium  leading-5 " >No skills yet</span>}
                    </div>
                </div>
                <div className="flex items-center gap-2 relative">
                    <input ref={knownRef} onChange={(e) => { setKnownInput(e.target.value); if (e.target.value.length > 2) availableMutation.mutate({ data: e.target.value }) }} placeholder="Add a skill you know..." type="text" className="input flex-1 min-w-0" />
                    <button onClick={() => {
                        dispatch(addKnownSkill(knownInput));
                        mutationAddKnown.mutate(knownInput);
                        if (knownRef.current)
                            knownRef.current.value = ""
                    }} className="button-blue flex-shrink-0">
                        <Plus />
                    </button>
                    {knownInput.length > 2 && knownRef?.current?.value !== "" && wantToLearnInput == "" &&
                        <div className="absolute top-full  left-0 z-10">
                            <div className="mt-1 input p-2  w-full max-w-[90vw] sm:max-w-[350px] max-h-60  flex gap-1  bg-white">
                                {availableSkills.length > 0 ? <div className="flex flex-wrap gap-1  overflow-y-auto   ">
                                    {availableSkills.map((skill, idx) => (
                                        <button type="button" onClick={() => {
                                            dispatch(addKnownSkill(skill.title)); mutationAddKnown.mutate(skill.title);
                                            if (knownRef.current)
                                                knownRef.current.value = ""
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
            <div className="_border p-6 pt-[21px] rounded-2xl flex flex-col">
                <h2 className="text-2xl leading-6 font-bold mb-4">Skills I Want to Learn</h2>
                <div className="basis-full">
                    <div className="flex gap-2  flex-wrap mb-6 overflow-y-auto max-h-[170px] ">
                        {user?.skillsToLearn && user?.skillsToLearn?.length > 0 ? user.skillsToLearn.map((skill, idx) => (
                            <div key={idx} className="bg-blue text-sm leading-5 font-medium h-fit flex w-fit gap-2 px-3.5 text-white py-2 items-center rounded-2xl">
                                {skill.title}
                                <button onClick={() => {
                                    dispatch(deleteWantToLearnSkill(skill.title))
                                    mutationDeleteLearn.mutate(skill.title);
                                }} className="outline-0hover:text-darkBlue cursor-pointer transition-all" ><X size={14} /></button>
                            </div>
                        )) :
                            <span className="font-medium  leading-5 " >No skills yet</span>}
                    </div>
                </div>
                <div className="flex items-center gap-2 relative">

                    <input ref={learnRef} onChange={(e) => { setWantToLearnInput(e.target.value); if (e.target.value.length > 2) availableMutation.mutate({ data: e.target.value }) }} placeholder="Add a skill you want to learn..." type="text" className="input flex-1 min-w-0" />
                    <button onClick={() => {
                        dispatch(addWantToLearnSkill(wantToLearnInput));
                        mutationAddLearn.mutate(wantToLearnInput);
                        if (learnRef.current)
                            learnRef.current.value = ""
                        setWantToLearnInput("");
                    }} className="button-blue flex-shrink-0">
                        <Plus />
                    </button>
                    {wantToLearnInput.length > 2 && learnRef?.current?.value !== "" && knownInput == "" &&
                        <div className="absolute top-full left-0 z-10">

                            <div className="mt-1 input p-2  w-full max-w-[90vw] sm:max-w-[350px] max-h-60  flex gap-1  bg-white">
                                {availableSkills.length > 0 ? <div className="flex flex-wrap gap-1  overflow-y-auto">
                                    {availableSkills.map((skill, idx) => (
                                        <button type="button" onClick={() => {
                                            dispatch(addWantToLearnSkill(skill.title)); mutationAddLearn.mutate(skill.title);
                                            if (learnRef.current)
                                                learnRef.current.value = ""
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