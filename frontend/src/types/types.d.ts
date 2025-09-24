export interface IUser {
    id:string,
    name:string,
    email: string,
    knownSkills?:string[] |null ,
    skillsToLearn?:string[] |null ,
} 