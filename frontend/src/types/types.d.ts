export interface IUser {
    id: string,
    name: string,
    email: string,
    knownSkills?: { id: string, title: string }[],
    skillsToLearn?: { id: string, title: string }[],
} 