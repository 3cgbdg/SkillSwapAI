"use client"


import EditProfile from "@/components/profile/EditProfile";
import Profile from "@/components/profile/Profile";
import { useState } from "react";

const Page = () => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    return (
        <>
            {isEditing ? <EditProfile setIsEditing={setIsEditing} /> :
                <Profile setIsEditing={setIsEditing} />
            }
        </>


    )
}

export default Page