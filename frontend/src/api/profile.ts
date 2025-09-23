import { isAxiosError } from "axios";
import { api } from "./axiosInstance";
import { Dispatch, SetStateAction } from "react";

export  const updateProfile = async (payload: object, setError: Dispatch<SetStateAction<string | null>>) => {
    try {
        const res = await api.patch("/api/auth/profile",payload);
        console.log("niger");
        return res.data;

    } catch (err) {
        if (isAxiosError(err) && err.response) {
            setError(err.response.data.message);
        }
    }
}