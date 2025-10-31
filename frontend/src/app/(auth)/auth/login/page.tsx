"use client"
import AuthService from "@/services/AuthService";
import { logInFormData, logInSchema } from "@/validation/logIn";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ChromeIcon, GithubIcon, Lock, Mail } from "lucide-react";
import Image from "next/image"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";



const Page = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<logInFormData>({
    resolver: zodResolver(logInSchema)
  });
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async (data: logInFormData) => AuthService.logIn(data),
    onSuccess: () => router.push("/dashboard"),
  })


  const onSubmit: SubmitHandler<logInFormData> = async (data) => {
    mutation.mutate(data);
  }
  return (
    <div className="basis-[448px] _border rounded-[32px] p-[57px] flex justify-center bg-white z-10">
      <div className="flex flex-col gap-4 items-center mb-[46px] w-full">
        <div className="mb-1 ">
          <Image className="object-contain" src={"/logo.png"} height={44} width={44} alt="logo icon" />
        </div>
        <h1 className="font-dancing_script text-2xl leading-8 font-bold ">SkillSwap AI</h1>
        <h2 className="font-dancing_script text-3xl leading-9 font-bold ">Welcome Back!</h2>
        <p className="text-lg leading-7 text-gray">Log in to your SkillSwap AI account.</p>
        <form className="w-full flex flex-col gap-4" >
          <div className="flex flex-col gap-2">
            <label className="text-sm leading-[22px] font-medium" htmlFor="email">Email</label>
            <div className="relative input flex items-center gap-2 text-gray text-sm leading-[22px] ">
              <Mail size={16} />
              <input    {...register("email", {
                validate: {
                  // validating email format with regex
                  isValidEmailForm: (value) => {
                    if (!value) return true;
                    return /^\w+@\w+\.\w{2,3}$/.test(value) || "Wrong email format";
                  },
                  isEmpty: (value) => {
                    return value.length !== 0 || "Field is required";
                  },
                }
              })} className=" w-full outline-none" placeholder="Enter your email" type="text" id="email" />
            </div>

            {errors.email && (
              <span data-testid='error' className="text-red-500 font-medium ">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm leading-[22px] font-medium" htmlFor="password">Password</label>
            <div className="relative input flex items-center gap-2 text-gray text-sm leading-[22px] ">
              <Lock size={16} />
              <input  {...register("password", {
                validate: {
                  password: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value) || "Password must have at least one lowercase, one uppercase, one digit and minimum 8 characters",
                }
              })} className="w-full outline-none" placeholder="Enter your password" type="password" id="password" />
            </div>
            {errors.password && (
              <span data-testid='error' className="text-red-500 font-medium ">
                {errors.password.message}
              </span>
            )}
          </div>
        </form>
        <div className="w-full flex flex-col">
          <Link href={"#"} className="ml-auto  link">Forgot Password?</Link>
          <button onClick={handleSubmit(onSubmit)} id="log-in-btn" className="button-violet mt-6 ">Login</button>
        </div>
        <div className="flex items-center gap-2 w-full">
          <span className="text-gray text-xs leading-4  w-5">OR</span>
          <div className="my-9 border-[1px] border-neutral-200 w-full"></div>
        </div>
        <div className="flex items-center gap-[3px] mb-10">
          <button className="button-transparent gap-2 text-sm! leading-5.5! font-medium!">
            <ChromeIcon size={14} />
            Login with Google
          </button>
          <button className="button-transparent gap-2 text-sm! leading-5.5! font-medium!">
            <GithubIcon size={14} />
            Login with GitHub
          </button>
        </div>
        <div className="flex items-center gap-1 text-sm leading-5 ">
          <span className="text-gray">Don't have an account? </span>
          <Link href={"/auth/signup"} className="text-violet link">Sign Up</Link>
        </div>
      </div>
    </div>
  )
}

export default Page