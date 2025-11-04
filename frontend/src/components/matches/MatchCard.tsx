import { IChat, IMatch } from '@/types/types'
import { UseMutateFunction } from '@tanstack/react-query';
import { Book, Calendar, MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React from 'react'

const MatchCard = ({ match, isInActiveMatches, option, getOrCreateChat, generateActiveMatch }: { isInActiveMatches: boolean, option: 'available' | 'active', generateActiveMatch: UseMutateFunction<IMatch, Error, string, unknown>, match: IMatch, getOrCreateChat: UseMutateFunction<IChat, Error, { friendId: string; friendName: string; }, unknown> }) => {


    const router = useRouter();
    return (
        <div className="_border rounded-2xl p-6">
            <div className="flex flex-col gap-3 mb-3.5 items-center">
                <div className="size-16 rounded-full bg-black"></div>
                <h2 className="leading-7 text-lg font-semibold">{match.other.name}</h2>
            </div>
            <div className="flex flex-col gap-4 mb-6 grow-1">
                <div className="flex flex-col gap-2">
                    <h3 className="text-sm leading-5 font-medium">Teaches:</h3>
                    <div className="flex flex-wrap gap-2">
                        {match.other.knownSkills.map((skill, idx) => (
                            <span key={idx} className="text-xs leading-5 text-neutral-600 px-1.5 bg-lightBlue border-blue border-1 font-semibold rounded-xl">{skill.title}</span>

                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <h3 className="text-sm leading-5 font-medium">Wants to learn:</h3>
                    <div className="flex flex-wrap gap-2">
                        {match.other.skillsToLearn.map((skill, idx) => (
                            <span key={idx} className="text-xs leading-5 text-neutral-600 px-1.5 border-neutral-600  border-1 font-semibold rounded-xl">{skill.title}</span>
                        ))}
                    </div>
                </div>
                {match.aiExplanation &&
                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm leading-5 font-semibold">AI Match Explanation:</h3>
                        <p className="text-sm leading-5 text-gray">{match.aiExplanation}</p>
                    </div>
                }
            </div>
            <div className="">
                {match.compatibility &&
                    <div className="text-sm leading-5 font-medium flex flex-col gap-1">
                        <h2 >Compatibility: {match.compatibility}%</h2>
                        <div className="relative w-full rounded-md bg-neutral-300 h-1.5 overflow-hidden">
                            <div style={{ width: `${match.compatibility}%` }} className="absolute top-0 left-0  bg-blue h-full"></div>
                        </div>
                    </div>
                }
                <div className="grid grid-cols-3 gap-3  mt-6 flew-wrap place-self-end basis-full">
                    <button onClick={() => getOrCreateChat({ friendId: match.otherId, friendName: match.other.name })} className="button-blue flex gap-2 items-center  font-medium!">
                        <MessageSquare size={16} />
                        Start Chat</button>
                    <button onClick={() => router.push(`/calendar?schedule=true&name=${encodeURIComponent(match.other.name)}`)} className="button-transparent rounded-md! flex gap-2 items-center  font-medium!">
                        <Calendar size={16} />
                        Schedule Session
                    </button>
                    {option == 'available' ?
                        <button onClick={() => !isInActiveMatches ? generateActiveMatch(match.otherId) : router.push(`/matches/active`)} className={`button-transparent rounded-md!  flex gap-2 items-center  font-medium!`}>
                            <Book size={16} />
                            {isInActiveMatches ? 'Go to active matches' :
                                'Generate active match plan'
                            }

                        </button>
                        :
                        <button onClick={() => router.push(`/matches/${match.id}`)} className={`button-transparent rounded-md!  flex gap-2 items-center  font-medium!`}>
                            <Book size={16} />
                            Go to your plan
                        </button>
                    }
                </div>

            </div>
        </div>
    )
}

export default MatchCard