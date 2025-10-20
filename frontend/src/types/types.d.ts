export interface IUser {
    id: string;
    name: string;
    email: string;
    knownSkills?: { id: string; title: string }[];
    skillsToLearn?: { id: string; title: string }[];
}

export interface IFriend {
    name: string;
    id: string;
    newMessagesQuantity?: number;
    lastMessage?: { content: string; createdAt: string }
}

export interface IChat {
    _max: { createdAt: string };
    _count: { id: number };
    chatId: string;
    lastMessageContent?: string;
    friend: IFriend;

}

interface IMessage {
    id: string
    content: string;
    fromId: string;
    createdAt: Date;
    isSeen: boolean;
}


export interface ISession {
    id: string;
    title: string;
    start: number;
    end: number;
    description?: string;
    color: string;
    date: Date;
    friend: {
        id: string;
        name: string;
    };
    status: SessionStatusEnum;
}

export const SessionStatusEnum = {
    PENDING = "PENDING",
    AGREED = "AGREED"
} as const;


interface IRequest {
    id: string;
    fromId: string;
    toId: string;
    from: { name: string };
    to: { name: string };
    type: "FRIEND" |
    "SESSIONCREATED" |
    "SESSIONACCEPTED" |
    "SESSIONREJECTED";
    sessionId: string;
    session: {
        date?: string;
        start?: number;
        end?: number;
        title?: string;
    }//if request type is session 

}

export interface IMatch {
    compatibility: number,
    aiExplanation: string,
    keyBenefits: string[]

    id: string,
    initiatorId: string,
    otherId: string,
    other: {
        name: string
        knownSkills: {
            title: string
        }[],

        skillsToLearn: {
            title: string
        }[],
    }
}

export interface IGeneratedPlan {
    modules: IGeneratedModule[]
}

export interface IGeneratedModule {
      id: string;
        title: string,
        status: ModuleStatus,
        objectives: string[],
        activities: string[],
        timeline: number,
        resources: {
            id: string
            title: string,
            description?: string,
            link: string
        }[]
}