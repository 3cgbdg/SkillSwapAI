"use client"
import AuthService from '@/services/AuthService';
import MatchesService from '@/services/MatchesService';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { getProfile } from '@/redux/authSlice';
import { getMatches } from '@/redux/matchesSlice';
import { IMatch, IUser } from '@/types/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ProfilesService from '@/services/ProfilesService';

// fetching data component every reload
const AuthClientUpload = () => {
    const dispatch = useAppDispatch();

    const router = useRouter();
    useEffect(() => {
        const getUser = async () => {
            try {
                const user: IUser = await ProfilesService.getOwnProfile();
                dispatch(getProfile(user));
                const matches: IMatch[] = await MatchesService.getMatches();
                dispatch(getMatches(matches));
            } catch {
                router.push("/auth/login");
            }
        }

        getUser();

    }, []);
    return null;
}

export default AuthClientUpload