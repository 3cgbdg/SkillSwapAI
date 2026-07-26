export interface IUser {
  id: string;
  aiSuggestionSkills: string[] | null;
  name: string;
  email: string;
  knownSkills?: { id: string; title: string }[];
  skillsToLearn?: { id: string; title: string }[];
  imageUrl: string | undefined;
  bio: string;
  completedSessionsCount: number;
  lastSkillsGenerationDate: string;
}

export interface IFriend {
  name?: string;
  imageUrl: string | undefined;
  id: string;
  newMessagesQuantity?: number;
  lastMessage?: { content: string; createdAt: string };
}

export interface IChat {
  _max: { createdAt: string };
  _count: { id: number };
  chatId: string;
  lastMessageContent?: string;
  friend: IFriend;
}

export interface IMessage {
  id: string;
  content: string;
  fromId: string;
  createdAt: Date;
  isSeen: boolean;
}

export type { ISession, IRequest, SessionStatusType } from "./session";

export const SessionStatusEnum = {
  PENDING = "PENDING",
  AGREED = "AGREED",
} as const;

export interface IMatch {
  compatibility: number;
  aiExplanation?: string;
  keyBenefits: string[];
  id: string;
  isFriend?: boolean;
  other: {
    id: string;
    name: string;
    imageUrl: string;
    knownSkills: { title: string }[];
    skillsToLearn: { title: string }[];
  };
}

export interface IGeneratedPlan {
  id: string;
  modules: IGeneratedModule[];
}

export type ModuleStatus = "INPROGRESS" | "COMPLETED";

export interface IGeneratedModule {
  id: string;
  title: string;
  status: ModuleStatus;
  objectives: string[];
  activities: string[];
  timeline: number;
  resources: {
    id: string;
    title: string;
    description?: string;
    link: string;
  }[];
}

export type ApiResponse<T> = {
  success: boolean;
  status?: string | null;
  data?: T;
  message?: string;
  errors?: string[];
};

// type for form

export interface FoundUsers {
  id: string;
  name?: string;
}

export interface FoundSkills {
  id: string;
  title: string;
}
export type Found = FoundUsers &
  FoundSkills & {
    name?: string;
    title?: string;
  };

export interface SocketContextType {
  socket: Socket | null;
}
