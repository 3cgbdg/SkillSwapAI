"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Mail, Lock, User, Plus, X } from "lucide-react";

import FullSreenLoader from "@/components/FullSreenLoader";
import Spinner from "@/components/Spinner";
import AuthService from "@/services/AuthService";
import ProfilesService from "@/services/ProfilesService";
import SkillsService from "@/services/SkillsService";
import { logInSchema } from "@/validation/logIn";
import { signUpSchema } from "@/validation/signUp";

type AuthMode = "login" | "signup";

interface AuthFormProps {
    mode: AuthMode;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
    const isLogin = mode === "login";
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isPassSeen, setIsPassSeen] = useState(false);

    // Signup-specific state
    const [inputKnown, setInputKnown] = useState("");
    const [inputToLearn, setInputToLearn] = useState("");
    const [availableSkills, setAvailableSkills] = useState<{ id: string; title: string }[]>([]);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<any>({
        resolver: zodResolver(isLogin ? logInSchema : signUpSchema),
        defaultValues: isLogin ? {} : {
            knownSkills: [],
            skillsToLearn: [],
            checkBox: false,
        },
    });

    const knownSkills = watch("knownSkills") || [];
    const skillsToLearn = watch("skillsToLearn") || [];

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            if (isLogin) {
                return AuthService.logIn(data);
            } else {
                const { checkBox, ...signUpData } = data;
                return AuthService.signUp(signUpData, knownSkills, skillsToLearn);
            }
        },
        onSuccess: async (data) => {
            toast.success(data.message);
            try {
                await queryClient.prefetchQuery({
                    queryKey: ["profile"],
                    queryFn: ProfilesService.getOwnProfile,
                });
                router.push("/dashboard");
            } catch (err) {
                toast.error(`Unable to fetch profile after ${mode}.`);
            }
        },
        onError: (err: any) => {
            toast.error(err.message);
        },
    });

    const { mutate: getSkills, isPending: isFetchingSkills } = useMutation({
        mutationFn: async ({ chars }: { chars: string }) => SkillsService.getSkills(chars),
        onSuccess: (data: { id: string; title: string }[]) => setAvailableSkills(data),
        onError: (err: any) => toast.error(err.message),
    });

    const onSubmit: SubmitHandler<any> = (data) => {
        mutation.mutate(data);
    };

    const handleSkillSearch = (value: string) => {
        if (value.length >= 2) {
            getSkills({ chars: value });
        }
    };

    const addSkill = (type: "known" | "learn", skill: string) => {
        const current = type === "known" ? knownSkills : skillsToLearn;
        const field = type === "known" ? "knownSkills" : "skillsToLearn";
        if (!current.includes(skill)) {
            setValue(field, [...current, skill], { shouldValidate: true });
        }
    };

    const removeSkill = (type: "known" | "learn", skill: string) => {
        const current = type === "known" ? knownSkills : skillsToLearn;
        const field = type === "known" ? "knownSkills" : "skillsToLearn";
        setValue(field, current.filter((s: string) => s !== skill), { shouldValidate: true });
    };

    const renderSkillSearch = (type: "known" | "learn", value: string, setValueFn: (v: string) => void) => (
        <div className="absolute top-full left-0 z-20">
            <div className="mt-1 input p-2 min-w-[150px] max-w-[350px] flex gap-1 flex-wrap bg-white border border-neutral-200 shadow-lg rounded-md">
                {!isFetchingSkills ? (
                    availableSkills.length > 0 ? (
                        <div className="flex flex-col gap-1 w-full">
                            {availableSkills.map((skill, idx) => (
                                <button
                                    type="button"
                                    onClick={() => {
                                        addSkill(type, skill.title);
                                        setValueFn("");
                                    }}
                                    key={idx}
                                    className="p-2 text-sm text-left hover:bg-violet/10 rounded-md transition-colors"
                                >
                                    {skill.title}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <span className="text-sm text-gray p-2">No skills found</span>
                    )
                ) : (
                    <div className="p-2"><Spinner size={24} color="blue" /></div>
                )}
            </div>
        </div>
    );

    return (
        <div className={`${isLogin ? "basis-[448px]" : "basis-[512px]"} w-full _border rounded-[32px] p-[40px] md:p-[57px] flex justify-center bg-white z-10 transition-all`}>
            {mutation.isPending && <FullSreenLoader />}

            <div className="flex flex-col gap-4 items-center w-full">
                <div className="mb-1">
                    <Image src="/logo.png" height={44} width={44} alt="SkillSwap AI Logo" />
                </div>

                <h1 className="font-oswald text-2xl leading-8 font-bold">
                    <span className="text-cyan-400">Skill</span>
                    <span className="text-yellow-400">Swap</span>AI
                </h1>

                <h2 className="font-oswald text-3xl leading-9 font-bold text-center">
                    {isLogin ? "Welcome Back!" : "Join Our Community"}
                </h2>

                <p className="text-lg leading-7 text-gray text-center mb-4">
                    {isLogin ? "Log in to your SkillSwap AI account." : "Create your account to connect and learn."}
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
                    {!isLogin && (
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium" htmlFor="name">Full Name</label>
                            <div className="relative input flex items-center gap-2 text-sm text-gray">
                                <User size={16} />
                                <input
                                    {...register("name")}
                                    className="w-full outline-none"
                                    placeholder="Enter your name"
                                    type="text"
                                    id="name"
                                />
                            </div>
                            {errors.name && <span className="text-red-500 text-sm">{errors.name.message as string}</span>}
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium" htmlFor="email">Email</label>
                        <div className="relative input flex items-center gap-2 text-sm text-gray">
                            <Mail size={16} />
                            <input
                                {...register("email")}
                                className="w-full outline-none"
                                placeholder="Enter your email"
                                type="text"
                                id="email"
                            />
                        </div>
                        {errors.email && <span className="text-red-500 text-sm">{errors.email.message as string}</span>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium" htmlFor="password">Password</label>
                        <div className="relative input flex items-center gap-2 text-sm text-gray">
                            <Lock size={16} />
                            <input
                                {...register("password")}
                                className="w-full outline-none"
                                placeholder="Enter your password"
                                type={isPassSeen ? "text" : "password"}
                                id="password"
                            />
                        </div>
                        {errors.password && <span className="text-red-500 text-sm">{errors.password.message as string}</span>}
                    </div>

                    {!isLogin && (
                        <>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium" htmlFor="confirmPassword">Confirm Password</label>
                                <div className="relative input flex items-center gap-2 text-sm text-gray">
                                    <Lock size={16} />
                                    <input
                                        {...register("confirmPassword")}
                                        className="w-full outline-none"
                                        placeholder="Confirm your password"
                                        type="password"
                                        id="confirmPassword"
                                    />
                                </div>
                                {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword.message as string}</span>}
                            </div>

                            {/* Skills Selection */}
                            <div className="flex flex-col gap-2 z-10">
                                <label className="text-sm font-medium">Skills I Know</label>
                                <div className="flex gap-2 relative">
                                    <input
                                        value={inputKnown}
                                        onChange={(e) => {
                                            setInputKnown(e.target.value);
                                            handleSkillSearch(e.target.value);
                                        }}
                                        className="w-full input text-sm"
                                        placeholder="e.g., Web Development"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { if (inputKnown) { addSkill("known", inputKnown); setInputKnown(""); } }}
                                        className="button-violet px-4 py-2"
                                    >
                                        Add
                                    </button>
                                    {inputKnown.length >= 2 && renderSkillSearch("known", inputKnown, setInputKnown)}
                                </div>
                                <div className="flex gap-2 flex-wrap min-h-6">
                                    {knownSkills.map((skill: string) => (
                                        <span key={skill} className="bg-violet/10 text-violet px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-violet/20">
                                            {skill}
                                            <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => removeSkill("known", skill)} />
                                        </span>
                                    ))}
                                </div>
                                {errors.knownSkills && <span className="text-red-500 text-xs">{errors.knownSkills.message as string}</span>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Skills To Learn</label>
                                <div className="flex gap-2 relative">
                                    <input
                                        value={inputToLearn}
                                        onChange={(e) => {
                                            setInputToLearn(e.target.value);
                                            handleSkillSearch(e.target.value);
                                        }}
                                        className="w-full input text-sm"
                                        placeholder="e.g., UI/UX Design"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { if (inputToLearn) { addSkill("learn", inputToLearn); setInputToLearn(""); } }}
                                        className="button-violet px-4 py-2"
                                    >
                                        Add
                                    </button>
                                    {inputToLearn.length >= 2 && renderSkillSearch("learn", inputToLearn, setInputToLearn)}
                                </div>
                                <div className="flex gap-2 flex-wrap min-h-6">
                                    {skillsToLearn.map((skill: string) => (
                                        <span key={skill} className="bg-cyan-500/10 text-cyan-600 px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-cyan-500/20">
                                            {skill}
                                            <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => removeSkill("learn", skill)} />
                                        </span>
                                    ))}
                                </div>
                                {errors.skillsToLearn && <span className="text-red-500 text-xs">{errors.skillsToLearn.message as string}</span>}
                            </div>

                            <div className="flex flex-col gap-2 mt-2">
                                <div className="flex items-center gap-2">
                                    <input {...register("checkBox")} className="accent-violet size-4" type="checkbox" id="terms" />
                                    <label htmlFor="terms" className="text-sm text-gray font-medium cursor-pointer">
                                        Accept <span className="text-violet">Terms and Conditions</span>
                                    </label>
                                </div>
                                {errors.checkBox && <span className="text-red-500 text-xs">{errors.checkBox.message as string}</span>}
                            </div>
                        </>
                    )}

                    {isLogin && (
                        <button
                            onClick={() => setIsPassSeen(!isPassSeen)}
                            type="button"
                            className="text-gray-500 hover:text-violet text-sm transition-colors text-right"
                        >
                            {isPassSeen ? "Hide password" : "Show password"}
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="button-violet w-full py-4 mt-4 font-bold tracking-wide"
                    >
                        {isLogin ? "LOG IN" : "SIGN UP"}
                    </button>
                </form>

                <div className="flex items-center gap-2 w-full my-6">
                    <div className="grow border-t border-neutral-200"></div>
                    <span className="text-gray-400 text-xs font-bold px-2">OR</span>
                    <div className="grow border-t border-neutral-200"></div>
                </div>

                <div className="flex items-center gap-1 text-sm font-medium">
                    <span className="text-gray-500">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                    </span>
                    <Link href={isLogin ? "/auth/signup" : "/auth/login"} className="text-violet hover:underline underline-offset-4">
                        {isLogin ? "Sign Up" : "Log In"}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;
