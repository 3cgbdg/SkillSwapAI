"use client"
import { useAppDispatch } from "@/hooks/reduxHooks"
import { updateChats } from "@/redux/chatsSlice"
import ChatsService from "@/services/ChatsService"
import { IChat, IMatch } from "@/types/types"
import { useMutation } from "@tanstack/react-query"
import { Book, Calendar, MessageSquare, Search, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const GeneratedMatches = ({ matches }: { matches: IMatch[] }) => {
    const [filteredMatch, setFilteredMatch] = useState<IMatch[]>(matches);
    const [panel, setPanel] = useState<'skill' | 'compatibility' | null>(null);
    const dispatch = useAppDispatch();
    const router = useRouter();
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            if (!target.closest(".panel")) {
                setPanel(null);
            }
        };

        if (panel) {
            document.addEventListener("click", handleClickOutside);
        }

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [panel]);

    const { mutate: getOrCreateChat, data: chat } = useMutation({
        mutationFn: async ({ friendId, friendName }: { friendId: string, friendName: string }): Promise<IChat> => ChatsService.createChat({ friendName, friendId }),
        onSuccess: (data) => {
            dispatch(updateChats(data));
            router.push(`chats/${data.chatId}`);
        }
    })
    return (
        <div className="flex flex-col gap-7.5">

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="page-title">Your AI-Powered Matches</h1>
                    <div className="flex gap-3 relative">
                        <div className="relative">


                            <button onClick={() => setPanel(prev => prev == 'compatibility' ? null : 'compatibility')} className={`button-transparent ${panel == "compatibility" ? 'rounded-b-none! ' : ''} flex items-center gap-2 rounded-md!`}>
                                <Users size={16} />
                                Sort by Compatibility
                            </button>
                            {panel == "compatibility" &&
                                <div className="w-full panel absolute top-full flex _border flex-col gap-1 rounded-b-md p-1">
                                    <button onClick={() => setFilteredMatch(prev => [...prev].sort((a, b) => a.compatibility - b.compatibility))} className="button-transparent p-2!">From lowest to highest</button>
                                    <button onClick={() => setFilteredMatch(prev => [...prev].sort((a, b) => b.compatibility - a.compatibility))} className="button-transparent p-2!">From highest to lowest</button>
                                </div>

                            }
                        </div>
                        <div className="relative">
                            <button onClick={() => setPanel(prev => prev == 'skill' ? null : 'skill')} className={`button-transparent min-w-[200px]  flex items-center gap-2 rounded-md! ${panel == "skill" ? 'rounded-b-none! ' : ''}`}>
                                <Search size={16} />
                                Filter by Skill
                            </button>
                            {panel == "skill" &&
                                <div className="p-1 absolute panel top-full rounded-b-md  _border">
                                    <input onChange={(e) => {
                                        const value = e.target.value.toLowerCase().trim();
                                        console.log(value);
                                        setFilteredMatch(matches.filter(match => match.other.knownSkills.some(item => item.title.toLowerCase().includes(value)) || match.other.skillsToLearn.some(item => item.title.toLowerCase().includes(value))))
                                    }} placeholder="Type in a skill" className="input rounded-md! w-full" />
                                </div>

                            }
                        </div>
                    </div>
                </div>
                <p className="text-gray">Explore potential skill exchange partners based on your teaching and learning goals. Connect to swap knowledge!</p>
            </div>
            <div className="grid grid-cols-3 gap-6 ">
                {filteredMatch.map(match => (
                    <div key={match.id} className="_border rounded-2xl p-6">
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
                            <div className="flex flex-col gap-2">
                                <h3 className="text-sm leading-5 font-semibold">AI Match Explanation:</h3>
                                <p className="text-sm leading-5 text-gray">{match.aiExplanation}</p>
                            </div>
                        </div>
                        <div className="">
                            <div className="text-sm leading-5 font-medium flex flex-col gap-1">
                                <h2 >Compatibility: {match.compatibility}%</h2>
                                <div className="relative w-full rounded-md bg-neutral-300 h-1.5 overflow-hidden">
                                    <div style={{ width: `${match.compatibility}%` }} className="absolute top-0 left-0  bg-blue h-full"></div>
                                </div>
                            </div>
                            {/* todo */}
                            <div className="flex gap-3 items-center mt-6 flew-wrap max-w-[400px] place-self-end basis-full">
                                <button onClick={() => getOrCreateChat({ friendId: match.otherId, friendName: match.other.name })} className="button-blue flex gap-2 items-center  font-medium!">
                                    <MessageSquare size={16} />
                                    Start Chat</button>
                                {/* todo button */}
                                <button className="button-transparent rounded-md! flex gap-2 items-center  font-medium!">
                                    <Calendar size={16} />
                                    Schedule Session
                                </button>
                                <button onClick={() => router.push(`/matches/${match.id}`)} className="button-transparent rounded-md! flex gap-2 items-center  font-medium!">
                                    <Book size={16} />
                                    Go to teach material
                                </button>
                            </div>

                        </div>
                    </div>
                ))}

            </div>
        </div>
    )
}

export default GeneratedMatches