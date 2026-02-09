export interface IUser {
    id: string;
    aiSuggestionSkills: string[] | null;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
    knownSkills?: { id: string; title: string }[];
    skillsToLearn?: { id: string; title: string }[];
    imageUrl: string | undefined;
    bio: string;
    completedSessionsCount: number;
    lastSkillsGenerationDate: string;
}
