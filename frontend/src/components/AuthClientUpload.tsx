"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import FullSreenLoader from "./FullSreenLoader";
import useProfile from "@/hooks/useProfile";
import useMatches from "@/hooks/useMatches";
import useSessions from "@/hooks/useSessions";

// fetching data component every reload
const AuthClientUpload = () => {
  const router = useRouter();

  const {
    isLoading: isProfileLoading,
    isError: isProfileError
  } = useProfile();

  const {
    isLoading: isMatchesLoading,
    isError: isMatchesError
  } = useMatches();

  const {
    isLoading: isSessionsLoading,
    isError: isSessionsError
  } = useSessions();

  const isLoading = isProfileLoading || isMatchesLoading || isSessionsLoading;
  const isError = isProfileError || isMatchesError || isSessionsError;

  useEffect(() => {
    if (isError) {
      router.push("/auth/login");
    }
  }, [isError, router]);

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isLoading]);

  if (isLoading) {
    return <FullSreenLoader />;
  }

  return null;
};

export default AuthClientUpload;
