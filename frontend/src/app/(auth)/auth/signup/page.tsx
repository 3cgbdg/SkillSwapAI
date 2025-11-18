"use client"
import AuthService from "@/services/AuthService";
import SkillsService from "@/services/SkillsService";
import { signUpFormData, signUpSchema } from "@/validation/signUp";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import Image from "next/image"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";



// request->available -----

const Page = () => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<signUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      knownSkills: [],
      skillsToLearn: [],
      checkBox: false,
    }
  });
  const router = useRouter();
  const [inputKnown, setInputKnown] = useState<string>("");
  const [inputToLearn, setInputToLearn] = useState<string>("");
  const [availableSkills, setAvailableSkills] = useState<{ id: string, title: string }[]>([]);
  const mutation = useMutation({
    mutationFn: async (data: Omit<signUpFormData, 'checkBox'>) => AuthService.signUp(data, knownSkills, skillsToLearn),
    onSuccess: (data) => {
      toast.success(data.message)
      setTimeout(() => router.push("/dashboard"), 500);
    },
    onError: (err) => {
      toast.error(err.message)
    }
  })

  const { mutate: getSkills } = useMutation({
    mutationFn: async ({ chars }: { chars: string }) => {
      const skills = await SkillsService.getSkills(chars);
      console.log(skills)
      return skills;
    },
    onSuccess: (data: { id: string, title: string }[]) => setAvailableSkills(data),
  })


  const onSubmit: SubmitHandler<signUpFormData> = async (data) => {
    if (!data.checkBox) {
      console.error("Terms and conditions are not accepted!");
      return null;
    }
    const { checkBox, ...newData } = data;
    mutation.mutate(newData);
  }

  /// managing adding-skills system 
  const knownSkills = watch("knownSkills") || [];
  const skillsToLearn = watch("skillsToLearn") || [];


  const addKnownSkill = (skill: string) => {
    setValue("knownSkills", [...knownSkills, skill], { shouldValidate: true });
  }


  const removeKnownSkill = (skill: string) => {
    setValue("knownSkills", knownSkills.filter(s => s !== skill), { shouldValidate: true });
  }

  const addWantToLearnSkill = (skill: string) => {
    setValue("skillsToLearn", [...skillsToLearn, skill], { shouldValidate: true });
  }


  const removeWantToLearnSkill = (skill: string) => {
    setValue("skillsToLearn", skillsToLearn.filter(s => s !== skill), { shouldValidate: true });
  }
  ///
  return (
    <div className="basis-[512px] w-full _border rounded-[32px] p-[57px] flex justify-center bg-white z-10">
      <div className="flex flex-col gap-4 items-center mb-[46px] w-full">
        <div className="mb-1 ">
          <Image className="object-contain" src={"/logo.png"} height={44} width={44} alt="logo icon" />
        </div>
        <h1 className="font-oswald text-2xl leading-8 font-bold "><span className="text-cyan-300">Skill</span><span className="text-yellow-300">Swap</span>AI</h1>
        <h2 className="font-oswald text-3xl leading-9 font-bold ">Welcome Back!</h2>
        <p className="text-lg leading-7 text-gray">Create your account to connect and learn.</p>

        <form className="w-full flex flex-col gap-4" >

          <div className="flex flex-col gap-2">
            <label className="text-sm leading-[22px] font-medium" htmlFor="email">Name</label>
            <input    {...register("name")} className=" w-full input" placeholder="Enter your name" type="text" id="name" />


            {errors.name && (
              <span data-testid='error' className="text-red-500 font-medium ">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm leading-[22px] font-medium" htmlFor="email">Email</label>
            <input    {...register("email")} className=" w-full input" placeholder="Enter your email" type="text" id="email" />


            {errors.email && (
              <span data-testid='error' className="text-red-500 font-medium ">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm leading-[22px] font-medium" htmlFor="password">Password</label>
            <input  {...register("password")} className="w-full input" placeholder="Enter your password" type="password" id="password" />

            {errors.password && (
              <span data-testid='error' className="text-red-500 font-medium ">
                {errors.password.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm leading-[22px] font-medium" htmlFor="password">Confirm Password</label>
            <input  {...register("confirmPassword")} className="w-full input" placeholder="Confirm your  password" type="password" id="password" />

            {errors.confirmPassword && (
              <span data-testid='error' className="text-red-500 font-medium ">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2 z-10">
            <label className="text-sm leading-[22px] font-medium" htmlFor="knownSkills">Known Skills</label>
            <div className="flex gap-2 relative">
              <input value={inputKnown} onChange={(e) => {
                setInputKnown(e.target.value);
                if (e.target.value.length >= 1)
                  getSkills({ chars: e.target.value });
              }} className="w-full input" placeholder="e.g., Web Development, UI/UX Design, Data Analysis" id="password" />
              <button onClick={() => {
                if (inputKnown !== "") {
                  addKnownSkill(inputKnown);
                  setInputKnown("");
                }
              }} type="button" className="button-violet text-sm! leading-5.5!">Add skill</button>
              {inputKnown.length >= 1 &&
                <div className="absolute top-full left-0">
                  <div className="mt-1 input p-2  min-w-[150px] max-w-[350px] flex gap-1 flex-wrap bg-white">
                    {availableSkills.length > 0 ? <div className="flex flex-col gap-1">
                      {availableSkills.map((skill, idx) => (
                        <button type="button" onClick={() => {
                          addKnownSkill(skill.title);
                          setInputKnown("")
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
            <div className="flex gap-1 flex-wrap">
              {knownSkills?.map((skill, idx) => (
                <button key={idx} type="button" onClick={() => { removeKnownSkill(skill) }} className="input cursor-pointer w-fit text-sm leading-5 py-1! transition-colors hover:bg-red-400 flex items-center gap-1">
                  <span>{skill}</span>
                  <X size={14} />
                </button>
              ))}



              {errors.knownSkills && (
                <span data-testid='error' className="text-red-500 font-medium ">
                  {errors.knownSkills.message}
                </span>)}
            </div>


          </div>

          <div className="flex flex-col gap-2 ">
            <label className="text-sm leading-[22px] font-medium" htmlFor="skillsToLearn">Skills To Learn</label>
            <div className="flex gap-2 relative">
              <input value={inputToLearn} onChange={(e) => {
                setInputToLearn(e.target.value);
                if (e.target.value.length >= 2)
                  getSkills({ chars: e.target.value });
              }} className="w-full input" placeholder="e.g., Web Development, UI/UX Design, Data Analysis" id="password" />
              <button onClick={() => {
                if (inputToLearn !== "") {
                  addWantToLearnSkill(inputToLearn)
                  setInputToLearn("");
                }
              }} type="button" className="button-violet text-sm! leading-5.5!">Add skill</button>

              {inputToLearn.length >= 2 &&
                <div className="absolute top-full  left-0">
                  <div className="mt-1 input p-2  min-w-[150px] max-w-[350px] flex gap-1 flex-wrap bg-white">
                    {availableSkills.length > 0 ? <div className="flex flex-col gap-1">
                      {availableSkills.map((skill, idx) => (
                        <button type="button" onClick={() => { addWantToLearnSkill(skill.title); setInputToLearn("") }} key={idx} className="input text-sm! cursor-pointer leading-5! font-medium transition-colors hover:bg-violet">
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
            <div className="flex gap-1 flex-wrap">
              {skillsToLearn?.map((skill, idx) => (
                <button key={idx} type="button" onClick={() => { removeWantToLearnSkill(skill) }} className="input cursor-pointer w-fit text-sm leading-5 py-1! transition-colors hover:bg-red-400 flex items-center gap-1">
                  <span>{skill}</span>
                  <X size={14} />
                </button>
              ))}

              {errors.skillsToLearn && (
                <span data-testid='error' className="text-red-500 font-medium ">
                  {errors.skillsToLearn.message}
                </span>)}

            </div>

          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input  {...register("checkBox")}
                className="checked:bg-violet" type="checkbox" />
              <label className="text-sm leading-5 font-medium"><span className="text-violet">Accept</span> Terms and Conditions</label>
            </div>
            {errors.checkBox && (
              <span data-testid='error' className="text-red-500 font-medium ">
                {errors.checkBox.message}
              </span>
            )}
          </div>
        </form>
        <div className="w-full">
          <button onClick={handleSubmit(onSubmit)} id="log-in-btn" className="button-violet mt-6 w-full">Sign Up</button>
        </div>
        <div className="flex items-center gap-1 text-sm leading-5 ">
          <span className="text-gray">Already have an account?</span>
          <Link href={"/auth/login"} className="text-violet link">Log In</Link>
        </div>
      </div>
    </div>
  )
}

export default Page