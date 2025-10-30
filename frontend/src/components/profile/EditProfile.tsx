"use client"
import AddSkills from "@/components/profile/AddSkills";
import { Dispatch, useState } from "react";
import { SetStateAction } from "react";
import { useAppSelector } from "@/hooks/reduxHooks";
import Image from "next/image";
import { UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

type formType = {
    fullName: string,
    email: string,
    bio: string,
}

const EditProfile = ({ setIsEditing }: { setIsEditing: Dispatch<SetStateAction<boolean>> }) => {
    const { user } = useAppSelector(state => state.auth);
    const { register, handleSubmit, formState: { errors }, reset } = useForm<formType>();
    const [isCurrentlyEditing, setIsCurrentlyEditing] = useState<boolean>(false);

    const { mutate: saveChanges } = useMutation({
        mutationFn: async () => {

        }
    })

    return (
        <div className="flex flex-col gap-7.5">
            <h1 className="page-title">Edit Profile</h1>
            <div className="flex flex-col gap-6">
                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-1 p-6 pt-[27px]! flex flex-col justify-between gap-4  _border rounded-[10px]">
                        <div className="flex flex-col  gap-3.5">
                            <h2 className="text-lg leading-7 font-semibold ">Profile Picture</h2>
                            <div className="rounded-full size-30 flex justify-center mx-auto items-center _border">
                                {user?.imageUrl ?
                                    <Image src={user.imageUrl} alt="user image" />
                                    :
                                    <UserRound size={52} />
                                }
                            </div>
                        </div>
                        <button className="button-blue">Update Picture</button>
                        <button className="button-transparent rounded-md!">Remove Picture</button>

                    </div>
                    <form className="col-span-2 p-6 pt-[27px]! gap-4 flex flex-col _border rounded-[10px]">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-lg leading-7 font-semibold">Personal Information</h2>
                            <p className="text-sm leading-5 text-gray">
                                Update your personal details and contact information.
                            </p>
                        </div>
                        <div className="grid grid-cols gap-3.5">
                            <div className="col-span-1 flex flex-col gap-2">

                                <label className="text-sm leading-[22px] font-medium" htmlFor="fullname">Full Name</label>
                                <input defaultValue={user?.name} {...register("fullName", {
                                    validate: {
                                        isEmpty: (value) => {
                                            return value.length !== 0 || "Field is required";
                                        },
                                    }, onChange: (e) => {
                                        setIsCurrentlyEditing(true);
                                    },
                                })} className=" w-full input" placeholder="Enter your fullname" type="text" id="fullName" />


                                {errors.fullName && (
                                    <span data-testid='error' className="text-red-500 font-medium ">
                                        {errors.fullName.message}
                                    </span>
                                )}
                            </div>
                            <div className="col-span-1 flex flex-col gap-2">

                                <label className="text-sm leading-[22px] font-medium" htmlFor="email">Email</label>
                                <input defaultValue={user?.email}   {...register("email", {
                                    validate: {

                                        isValidEmailForm: (value) => {
                                            if (!value) return true;
                                            return /^\w+@\w+\.\w{2,3}$/.test(value) || "Wrong email format";
                                        },
                                        isEmpty: (value) => {
                                            return value.length !== 0 || "Field is required";
                                        },
                                    }, onChange: (e) => {
                                        setIsCurrentlyEditing(true);
                                    },
                                })} className=" w-full input" placeholder="Enter your email" type="text" id="email" />


                                {errors.email && (
                                    <span data-testid='error' className="text-red-500 font-medium ">
                                        {errors.email.message}
                                    </span>
                                )}
                            </div>


                            <div className="col-span-2 flex flex-col gap-2">

                                <label className="text-sm leading-[22px] font-medium" htmlFor="bio">Bio/About Me</label>
                                <textarea defaultValue={user?.bio}     {...register("bio", {
                                    onChange: (e) => {
                                        setIsCurrentlyEditing(true);
                                    },
                                })} className=" min-h-14 w-full input" placeholder="Enter your bio" id="bio" />

                                {errors.bio && (
                                    <span data-testid='error' className="text-red-500 font-medium ">
                                        {errors.bio.message}
                                    </span>
                                )}
                            </div>

                        </div>
                    </form>
                </div>
                <AddSkills />
                {isCurrentlyEditing &&
                    <div className="_border rounded-[10px] w-full p-4 flex items-center justify-end">
                        <div className="flex items-center gap-4">
                            <button onClick={() => { reset(); setIsCurrentlyEditing(false) }} className="button-transparent rounded-md!">Cancel</button>
                            <button onClick={() => saveChanges()} className="button-blue">Save Changes</button>
                        </div>
                    </div>
                }

            </div>
        </div>
    )
}

export default EditProfile