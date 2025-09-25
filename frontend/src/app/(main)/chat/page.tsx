"use client"

import { EllipsisVertical, Send } from "lucide-react"

const Page = () => {
    return (
        <div className="flex gap-8 h-[705px]">
            <div className="_border rounded-[10px] py-6 px-4 basis-[368px] grow-0 ">
                <div className="flex flex-col gap-1.5 mb-4">
                    <h2 className="section-title">
                        Messages
                    </h2>
                    <p className="text-sm leading-5 text-gray">Recent conversations</p>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="rounded-[6px] p-3.5 bg-lightBlue flex gap-4 justify-between">
                        <div className="flex  gap-4 items-center">
                            <div className="rounded-full size-10 bg-black"></div>
                            <div className="">
                                <h3 className="">Alice Johnson</h3>
                                <p className="text-gray leading-5 text-sm">Great, see you then!</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                            <span className="text-xs leading-4 text-gray">{new Date().toLocaleTimeString()}</span>
                            <span className="rounded-full bg-blue text-white text-xs leading-5 font-semibold px-2 py-.5">2</span>
                        </div>
                    </div>
                    <div className="rounded-[6px] p-3.5  flex gap-4 justify-between">
                        <div className="flex  gap-4 items-center">
                            <div className="rounded-full size-10 bg-black"></div>
                            <div className="">
                                <h3 className="">Alice Johnson</h3>
                                <p className="text-gray leading-5 text-sm">Great, see you then!</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                            <span className="text-xs leading-4 text-gray">Yesterday</span>
                            <span className="rounded-full bg-blue text-white text-xs leading-5 font-semibold px-2 py-.5">2</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="_border rounded-[10px] flex flex-col grow-1 ">
                {/* header */}
                <div className="border-b-[1px] border-neutral-300 ">
                    <div className="py-5.5 px-6 flex justify-between items-center gap-2">
                        <div className="items-center flex gap-3">
                            <div className="rounded-full size-12 bg-black"></div>
                            <div className="">
                                <h3 className="text-xl leading-7 font-semibold">Alice User</h3>
                                <span className="text-sm leading-5 text-green-300">Online</span>
                            </div>
                        </div>
                        <button className="cursor-pointer p-1 rounded-md transition-all hover:bg-neutral-50">
                            <EllipsisVertical />
                        </button>
                    </div>
                </div>

                {/* content */}
                <div className="flex gap-4 flex-col p-4 w-full  grow-1">
                    <div className="w-fit rounded-[10px] bg-neutral-200 p-3 text-gray">
                        <p className="text-wrap mb-1  leading-5 text-sm">Hey there! Are you free for a quick chat about web development on Thursday?</p>
                        <div className="flex justify-end text-xs leading-4 ">10:20 AM</div>
                    </div>

                    <div className="w-fit rounded-[10px] bg-lightBlue p-3 place-self-end">
                        <p className="text-wrap mb-1  leading-5 text-sm">Hey there! Are you free for a quick chat about web development on Thursday?</p>
                        <div className="flex justify-end text-xs leading-4 ">10:20 AM</div>
                    </div>
                </div>

                {/* input */}
                <div className="border-t-[1px] border-neutral-300 w-full">
                    <div className="p-4 flex gap-4 items-center px-10 ">
                        <textarea className="input resize-none text-sm leading-5.5  w-full" placeholder="Type your message here..."></textarea>
                        <button className="button-blue h-10 aspect-square">
                            <Send size={16}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page