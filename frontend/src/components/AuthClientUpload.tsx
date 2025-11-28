"use client";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { fetchProfile } from "@/redux/authSlice";
import { fetchActiveMatches } from "@/redux/matchesSlice";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { fetchTodaysSessions } from "@/redux/sessionsSlice";
import FullSreenLoader from "./FullSreenLoader";

// fetching data component every reload
const AuthClientUpload = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);
  const activeMatchesState = useAppSelector((state) => state.matches);
  const router = useRouter();
  useEffect(() => {
    const getData = async () => {
      try {
        // trying fetching profile with retry logic
        let retries = 3;
        let lastError;
        while (retries > 0) {
          try {
            await dispatch(fetchProfile()).unwrap();
            break;
          } catch (err) {
            lastError = err;
            retries--;
            if (retries > 0) {
              // waiting before retrying
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          }
        }
        if (lastError && retries === 0) {
          throw lastError;
        }

        await dispatch(fetchActiveMatches()).unwrap();
        await dispatch(fetchTodaysSessions()).unwrap();
      } catch (err) {
        router.push("/auth/login");
      }
    };
    getData();
  }, [dispatch, router]);

  useEffect(() => {
    if (authState.loading || activeMatchesState.loading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [authState.loading, activeMatchesState.loading]);

  useEffect(() => {
    if (authState.error || activeMatchesState.error) {
      router.push("/auth/login");
    }
  }, [authState.error, activeMatchesState.error, router]);

  if (authState.loading || activeMatchesState.loading) {
    <FullSreenLoader />;
  }

  return null;
};

export default AuthClientUpload;
