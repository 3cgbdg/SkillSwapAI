"use client"
import { api } from '@/api/axiosInstance';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { getProfile } from '@/redux/authSlice';
import { getMatches } from '@/redux/matchesSlice';
import { IMatch } from '@/types/types';
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
                const res2 = await api.get(`/matches`);
                dispatch(getMatches(res2.data as IMatch[]));
            } catch {
                router.push("/auth/login");
            }
        }

        getUser();

    }, []);
    return null;
}

export default AuthClientUpload