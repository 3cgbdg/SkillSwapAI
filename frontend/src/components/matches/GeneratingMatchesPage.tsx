"use client"

import { IMatch } from "@/types/types"
import { UseMutateFunction } from "@tanstack/react-query"
import Image from "next/image"
import Spinner from "../Spinner"

const GeneratingMatchesPage = ({ isError,isPending, generateMatches }: { isPending: boolean,isError: boolean, generateMatches:UseMutateFunction<IMatch[], Error, void, unknown>}) => {
    return (
        <div className="text-center items-center flex-col flex pt-8">
            <div className="flex flex-col gap-4 mb-11">
                <h1 className="page-title">Discover Your Perfect Connections</h1>
                <p className="text-lg leading-7.5 text-gray max-w-[670px]  w-full">Our  AI  analyzes your preferences to find the most compatible matches. Initiate the journey to new connections now.</p>
            </div>
            <div className="overflow-hidden mb-12">
                <Image className="object-contain" src={"/matchesImage.png"} alt="matches image" width={256} height={256}></Image>
            </div>
            <div className="flex flex-col items-center gap-8">
                <p className="text-sm laeding-5 text-gray">Your matches will appear here shortly after generation.</p>
                <button disabled={isError ? true : false} onClick={() => generateMatches()} className={`button-violet rounded-4xl! disabled:cursor-auto! ${isPending && 'bg-darkBlue!'} disabled:bg-gray! w-[262px] h-16`}>{!isPending ? !isError ? 'Generate Matches' : 'Error' : <Spinner color="blue" size={32} />}</button>
            </div>
        </div>
    )
}

export default GeneratingMatchesPage