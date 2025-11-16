import { Check, X } from "lucide-react"
import { IRequest } from "@/types/types"

interface NotificationsListProps {
    reqs: IRequest[]
    onAcceptSession: ({ sessionId, requestId, friendId }: { sessionId: string, requestId: string, friendId: string }) => void
    onRejectSession: ({ sessionId, requestId, friendId }: { sessionId: string, requestId: string, friendId: string }) => void
    onAddFriend: ({ fromId, id }: { fromId: string, id: string }) => void
    onDeleteRequest: ({ requestId }: { requestId: string }) => void
}

const NotificationsList = ({
    reqs,
    onAcceptSession,
    onRejectSession,
    onAddFriend,
    onDeleteRequest
}: NotificationsListProps) => {
    return (
        <div className="flex flex-col gap-2 pb-4 not-last:border-b-[1px] border-neutral-300 w-full">
            <h3 className="text-lg leading-7 font-medium">Latest requests</h3>
            <div className="flex flex-col gap-1  border-neutral-300 max-h-[450px] overflow-x-auto">
                {reqs && reqs.map((req, index) => {
                    return (req.type == 'FRIEND' ?
                        <div key={index} className="flex gap-2 w-full _border p-2 flex-col">
                            <div className="flex flex-col  ">
                                <h2 className="text-lg leading-7 font-semibold">Friends Request 🧑‍🦰</h2>
                                <div className="     rounded-xl transition-all mb-4" > <span className="font-semibold">From:</span> {req.from?.name}</div>
                                <button onClick={() => onAddFriend({ fromId: req.fromId, id: req.id })} className="button-transparent"><Check size={16} /></button>
                            </div>
                        </div>
                        : req.type == 'SESSIONCREATED' ?
                            <div key={index} className="flex gap-2 w-full _border p-2 flex-col">
                                <div className="flex flex-col  ">
                                    <h2 className="text-lg leading-7 font-semibold">Session  Request 🗓️</h2>
                                    <div className="     rounded-xl transition-all " > <span className="font-semibold">From:</span> {req.from?.name}</div>
                                    {req.session.date && <div className="flex  flex-col  mb-4">
                                        <div className="     rounded-xl transition-all  font-medium" > <span className="font-semibold">Date:</span>{new Date(req.session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                        <div className="     rounded-xl transition-all  font-medium" > <span className="font-semibold">Time range:</span> {req.session.start}:00 - {req.session.end}:00</div>
                                    </div>
                                    }
                                    <div className="grid grid-cols-2 items-center gap-2 ">
                                        <button onClick={() => onAcceptSession({ sessionId: req.sessionId, requestId: req.id, friendId: req.fromId })} className="button-transparent"><Check size={16} /></button>
                                        <button onClick={() => onRejectSession({ sessionId: req.sessionId, requestId: req.id, friendId: req.fromId })} className="button-transparent"><X size={16} /></button>
                                    </div>
                                </div>
                            </div> : req.type == 'SESSIONACCEPTED' ?
                                <div className="flex flex-col  ">
                                    <h2 className="text-lg leading-7 font-semibold">Session  Request 🗓️</h2>
                                    <div className="     rounded-xl transition-all " > <span className="font-semibold">From:</span> {req.from?.name}</div>
                                    {req.session.title && <div className="flex  flex-col  mb-4">
                                        <div className="rounded-xl transition-all  font-medium" > <span className="font-semibold">Accepted</span> session: "{req.session.title}"</div>
                                    </div>
                                    }
                                    <div className="grid grid-cols-2 items-center gap-2 ">
                                        <button onClick={() => onDeleteRequest({ requestId: req.id })} className="button-transparent">OK</button>
                                    </div>
                                </div> :
                                <div className="flex flex-col  ">
                                    <h2 className="text-lg leading-7 font-semibold">Session  Request 🗓️</h2>
                                    <div className="     rounded-xl transition-all " > <span className="font-semibold">From:</span> {req.from?.name}</div>
                                    {req.session.title && <div className="flex  flex-col  mb-4">
                                        <div className="rounded-xl transition-all  font-medium" > <span className="font-semibold">Rejected</span> session: "{req.session.title}"</div>
                                    </div>
                                    }
                                    <div className="grid grid-cols-2 items-center gap-2 ">
                                        <button onClick={() => onDeleteRequest({ requestId: req.id })} className="button-transparent">OK</button>
                                    </div>
                                </div>
                    )
                })}
            </div>
        </div>
    )
}

export default NotificationsList
