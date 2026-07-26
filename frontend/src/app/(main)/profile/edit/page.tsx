"use client";

import EditProfile from "@/components/profile/EditProfile";
import { useRouter } from "next/navigation";

export default function ProfileEditPage() {
  const router = useRouter();
  return (
    <EditProfile
      setIsEditing={(editing) => {
        if (!editing) router.push("/profile");
      }}
    />
  );
}
