export interface IUser {
    id: string,
    name: string,
    email: string,
    knownSkills?: { id: string, title: string }[],
    skillsToLearn?: { id: string, title: string }[],
}

export interface IFriend {
    name: string,
    id: string,
    newMessagesQuantity: number,
    lastMessage: { content: string, createdAt: string }
}

export interface IChats{
    _max :{createdAt:string},
    _count:{id:number},
    chatId:string,
    lastMessageContent:string,
}