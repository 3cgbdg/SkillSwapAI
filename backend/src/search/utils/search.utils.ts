import { Skill, User } from "@prisma/client";

export interface ISearchUser {
    id: string;
    name: string | null;
}

interface ISearchSkill extends Skill {
    knownBy: { id: string }[];
    learnedBy: { id: string }[];
}

export class SearchUtils {
    static filterAndMapResults(skills: ISearchSkill[], users: User[], myId: string): (Skill | ISearchUser)[] {
        const formattedUsers = users.map((user) => ({
            id: user.id,
            name: user.name,
        }));

        const filteredSkills = skills.filter(
            (skill) =>
                !skill.knownBy.some((user) => user.id === myId) &&
                !skill.learnedBy.some((user) => user.id === myId),
        );

        return [...filteredSkills, ...formattedUsers];
    }
}
