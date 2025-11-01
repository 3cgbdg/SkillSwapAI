"use client"
import AddSkills from "@/components/profile/AddSkills";
import { Dispatch, useState } from "react";
import { SetStateAction } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import Image from "next/image";
import { UserRound } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { editProfileFormData, editProfileSchema } from "@/validation/editProfile";
import { zodResolver } from "@hookform/resolvers/zod";
import ProfilesService from "@/services/ProfilesService";
import { changeAvatar } from "@/redux/authSlice";
// import AvatarCropModal from "./AvatarCropModal";



const EditProfile = ({ setIsEditing }: { setIsEditing: Dispatch<SetStateAction<boolean>> }) => {
    const { user } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<editProfileFormData>({
        resolver: zodResolver(editProfileSchema)
    });
    const [isCurrentlyEditing, setIsCurrentlyEditing] = useState<boolean>(false);

    const { mutate: saveChanges } = useMutation({
        mutationFn: async () => {

        }
    })


    //submit func 

    const onSubmit: SubmitHandler<editProfileFormData> = async (data) => {

    }

    // for getting image src-fit url 
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const form = new FormData();
        console.log(file)
        form.append('image', file);
        const url = await ProfilesService.uploadImage(form);
        dispatch(changeAvatar(url))
    };


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
                                    <div className="w-[120px] h-[120px] rounded-full overflow-hidden relative">
                                        <Image className=" object-cover" src={user.imageUrl} fill alt="user image" />
                                    </div>
                                    :
                                    <UserRound size={52} />
                                }
                            </div>
                        </div>
                        <label className="button-blue cursor-pointer">
                            Update Picture
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
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

                                <label className="text-sm leading-[22px] font-medium" htmlFor="name">Name</label>
                                <input defaultValue={user?.name} {...register("name", {
                                    onChange: (e) => {
                                        setIsCurrentlyEditing(true);
                                    },
                                })} className=" w-full input" placeholder="Enter your name" type="text" id="name" />


                                {errors.name && (
                                    <span data-testid='error' className="text-red-500 font-medium ">
                                        {errors.name.message}
                                    </span>
                                )}
                            </div>
                            <div className="col-span-1 flex flex-col gap-2">

                                <label className="text-sm leading-[22px] font-medium" htmlFor="email">Email</label>
                                <input defaultValue={user?.email}   {...register("email", {
                                    onChange: (e) => {
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
                            <button onClick={handleSubmit(onSubmit)} className="button-blue">Save Changes</button>
                        </div>
                    </div>
                }
                {/* {isModalOpen && image && (
                    <AvatarCropModal
                        image={image}
                        onClose={() => setIsModalOpen(false)}
                    />
                )} */}

            </div>
        </div>
    )
}

export default EditProfile