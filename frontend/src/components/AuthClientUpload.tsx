"use client"
import { api } from '@/api/axiosInstance';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { getProfile } from '@/redux/authSlice';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// fetching data component every reload
const AuthClientUpload = () => {
    const dispatch = useAppDispatch();

    const router = useRouter();
    useEffect(() => {
        const getUser = async () => {
            try {
                const res1 = await api.get(`/auth/profile`);
                dispatch(getProfile(res1.data));
            } catch {
                router.push("/auth/login");
            }
        }

        getUser();

    }, []);
    return null;
}

export default AuthClientUpload