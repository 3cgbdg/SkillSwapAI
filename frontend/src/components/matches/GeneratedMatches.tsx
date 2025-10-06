"use client"
import { Calendar, MessageSquare, Search, Users } from "lucide-react"

const GeneratedMatches = () => {
    return (
        <div className="flex flex-col gap-7.5">

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="page-title">Your AI-Powered Matches</h1>
                    <div className="flex gap-3">
                        <button className="button-transparent flex items-center gap-2 rounded-md!">
                            <Users size={16} />
                            Sort by Compatibility
                        </button>
                        <button className="button-transparent flex items-center gap-2 rounded-md!">
                            <Search size={16} />
                            Filter by Skill
                        </button>
                    </div>
                </div>
                <p className="text-gray">Explore potential skill exchange partners based on your teaching and learning goals. Connect to swap knowledge!</p>
            </div>
            <div className="grid grid-cols-3 gap-6 ">
                <div className="_border rounded-2xl p-6">
                    <div className="flex flex-col gap-3 mb-3.5 items-center">
                        <div className="size-16 rounded-full bg-black"></div>
                        <h2 className="leading-7 text-lg font-semibold">User1</h2>
                    </div>
                    <div className="flex flex-col gap-4 mb-6 grow-1">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-sm leading-5 font-medium">Teaches:</h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs leading-5 text-neutral-600 px-1.5 bg-lightBlue border-blue border-1 font-semibold rounded-xl">React</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-sm leading-5 font-medium">Wants to learn:</h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs leading-5 text-neutral-600 px-1.5 border-neutral-600  border-1 font-semibold rounded-xl">Python</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-sm leading-5 font-semibold">AI Match Explanation:</h3>
                            <p className="text-sm leading-5 text-gray">You both want to learn Python and can teach each other JavaScript. Your shared interest in web development makes you a highly compatible pair for a collaborative</p>
                        </div>
                    </div>
                    <div className="">
                        <div className="text-sm leading-5 font-medium flex flex-col gap-1">
                            <h2 >Compatibility: 92%</h2>
                            <div className="relative w-full rounded-md bg-neutral-300 h-1.5 overflow-hidden">
                                <div className="absolute top-0 left-0 w-1/2 bg-blue h-full"></div>
                            </div>
                        </div>
                        <div className="flex gap-3 items-center mt-6 place-self-end basis-full">
                            <button className="button-blue flex gap-2 items-center  font-medium!">
                                <MessageSquare size={16} />
                                Start Chat</button>
                            <button className="button-transparent rounded-md! flex gap-2 items-center  font-medium!">
                                <Calendar size={16} />
                                Schedule Session
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default GeneratedMatches