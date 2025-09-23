"use client"
import { api } from "@/api/axiosInstance";
import { useMutation, useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import Image from "next/image"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type formType = {
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
  knownSkills: string,
  skillsToLearn: string,
  checkBox?: boolean,
}

// request->available -----

const Page = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<formType>();
  const router = useRouter();
  const [knownSkills, setKnownSkills] = useState<string[] | null>(null);
  const [inputKnown, setInputKnown] = useState<string>("");
  const [inputToLearn, setInputToLearn] = useState<string>("");
  const [skillsToLearn, setSkillsToLearn] = useState<string[] | null>(null);
  const [availableSkills, setAvailableSkills] = useState<string[] | null>(null);
  const mutation = useMutation({
    mutationFn: async (data: formType) => {
      api.post('/auth/signup', data);
    },
    onSuccess: () => router.push("/dashboard"),
  })


  const { mutate, isPending } = useMutation({
    mutationFn: async ({ data }: { data: string }) => {
      const res = await api.get('/skills', { params: { chars: data } });
      return res.data;
    },
    onSuccess: (data: string[]) => setAvailableSkills(data),
  })


  const onSubmit: SubmitHandler<formType> = async (data) => {
    if (!data.checkBox) {
      console.error("Didn`t accept terms and conditions!");
      return null;
    }
    const { checkBox, ...newData } = data;
    mutation.mutate(newData);
  }
  const passwordValue = watch("password");
  return (
    <div className="basis-[512px] w-full _border rounded-[32px] p-[57px] flex justify-center bg-white z-10">
      <div className="flex flex-col gap-4 items-center mb-[46px] w-full">
        <div className="mb-1 ">
          <Image className="object-contain" src={"/logo.png"} height={44} width={44} alt="logo icon" />
        </div>
        <h1 className="font-dancing_script text-2xl leading-8 font-bold ">SkillSwap AI</h1>
        <h2 className="font-dancing_script text-3xl leading-9 font-bold ">Welcome Back!</h2>
        <p className="text-lg leading-7 text-gray">Create your account to connect and learn.</p>

        <form className="w-full flex flex-col gap-4" >

          <div className="flex flex-col gap-2">
            <label className="text-sm leading-[22px] font-medium" htmlFor="email">Name</label>
            <input    {...register("name", {
              validate: {
                isEmpty: (value) => {
                  return value.length !== 0 || "Field is required";
                },
              }
            })} className=" w-full input" placeholder="Enter your name" type="text" id="name" />


            {errors.name && (
              <span data-testid='error' className="text-red-500 font-medium ">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm leading-[22px] font-medium" htmlFor="email">Email</label>
            <input    {...register("email", {
              validate: {

                isValidEmailForm: (value) => {
                  if (!value) return true;
                  return /^\w+@\w+\.\w{2,3}$/.test(value) || "Wrong email format";
                },
                isEmpty: (value) => {
                  return value.length !== 0 || "Field is required";
                },
              }
            })} className=" w-full input" placeholder="Enter your email" type="text" id="email" />


            {errors.email && (
              <span data-testid='error' className="text-red-500 font-medium ">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm leading-[22px] font-medium" htmlFor="password">Password</label>
            <input  {...register("password", {
              validate: {
                password: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value) || "Password must have at least one lowercase, one uppercase, one digit and minimum 8 characters",
              }
            })} className="w-full input" placeholder="Enter your password" type="password" id="password" />

            {errors.password && (
              <span data-testid='error' className="text-red-500 font-medium ">
                {errors.password.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm leading-[22px] font-medium" htmlFor="password">Confirm Password</label>
            <input  {...register("confirmPassword", {
              validate: {
                confirmPassword: (value) => value == passwordValue || "Passwords do not match",
              }
            })} className="w-full input" placeholder="Confirm your  password" type="password" id="password" />

            {errors.confirmPassword && (
              <span data-testid='error' className="text-red-500 font-medium ">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm leading-[22px] font-medium" htmlFor="knownSkills">Known Skills</label>
            <div className="flex gap-2 relative">
              <input value={inputKnown} onChange={(e) => {
                setInputKnown(e.target.value);
                if(e.target.value.length>2)
                mutate({ data: e.target.value });
}              } className="w-full input" placeholder="e.g., Web Development, UI/UX Design, Data Analysis" id="password" />
              <button onClick={() => {
                if (inputKnown !== "") {
                  setKnownSkills(prev => prev ? [...prev, inputKnown] : [inputKnown]);
                  setInputKnown("");
                }
              }} type="button" className="button-violet text-sm! leading-5.5!">Add skill</button>
              {inputKnown.length > 2 &&
                <div className="absolute top-full left-0">
                  <div className="mt-1 input p-2 z-10 min-w-[150px] bg-white">
                    {availableSkills ? <div className="flex flex-col gap-1">
                      {availableSkills.map((skill, idx) => (
                        <button onClick={() => setInputKnown(skill)} key={idx} className="input transition-colors hover:bg-violet">
                          {skill}
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
                <button key={idx} type="button" onClick={() => { setKnownSkills(prev => prev ? prev.filter(item => item !== skill) : []) }} className="input cursor-pointer w-fit text-sm leading-5 py-1! transition-colors hover:bg-red-400 flex items-center gap-1">
                  <span>{skill}</span>
                  <X size={14} />
                </button>
              ))}



            </div>
            <input type="hidden"  {...register("knownSkills", {
              validate: {
                isEmpty: (value) => {
                  return value.length !== 0 || "Field is required";
                },
              }
            })} />
            {errors.knownSkills && (
              <span data-testid='error' className="text-red-500 font-medium ">
                {errors.knownSkills.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm leading-[22px] font-medium" htmlFor="wantToLearnSkills">Skills to Learn</label>
            <div className="flex gap-2">
              <input className="w-full input " placeholder="e.g., Machine Learning, Cloud Computing, Project Management" id="password" />
              <button type="button" className="button-violet text-sm! leading-5.5!">Add skill</button>
            </div>
            <input type="hidden"  {...register("skillsToLearn", {
              validate: {
                isEmpty: (value) => {
                  return value.length !== 0 || "Field is required";
                },
              }
            })} />

            {errors.skillsToLearn && (
              <span data-testid='error' className="text-red-500 font-medium ">
                {errors.skillsToLearn.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input  {...register("checkBox", {
                required: "Accept to Continue"

              })}
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