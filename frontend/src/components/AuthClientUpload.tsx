"use client"
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { fetchProfile } from '@/redux/authSlice';
import { fetchActiveMatches } from '@/redux/matchesSlice';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Spinner from './Spinner';
import { fetchTodaysSessions } from '@/redux/sessionsSlice';

// fetching data component every reload
const AuthClientUpload = () => {
    const dispatch = useAppDispatch();
    const authState = useAppSelector(state => state.auth);
    const activeMatchesState = useAppSelector(state => state.matches);
    const router = useRouter();
    useEffect(() => {
        const getData = async () => {
            try {
                await dispatch(fetchProfile()).unwrap();
                await dispatch(fetchActiveMatches()).unwrap();
                await dispatch(fetchTodaysSessions()).unwrap();
            } catch {
                router.push("/auth/login");
            }
        };
        getData();
    }, [dispatch, router]);

    useEffect(() => {
        if (authState.loading || activeMatchesState.loading) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = ""
        }
    }, [authState.loading, activeMatchesState.loading]);

    useEffect(() => {
        if (authState.error || activeMatchesState.error) {
            router.push("/auth/login");
        }
    }, [authState.error, activeMatchesState.error, router]);

    if (authState.loading || activeMatchesState.loading) {
        return <div className="fixed inset-0 flex items-center justify-center page-title bg-gray/80 z-100 overflow-hidden">
            <Spinner size={40} color='blue' />
        </div>


    }


    return null;
}

export default AuthClientUpload