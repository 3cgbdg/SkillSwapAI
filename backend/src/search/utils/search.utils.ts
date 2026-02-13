export class SearchUtils {
    static filterAndMapResults(skills: any[], users: any[], myId: string) {
        const formattedUsers = users.map((user) => ({
            id: user.id,
            name: user.name,
        }));

        const filteredSkills = skills.filter(
            (skill) =>
                !skill.knownBy.some((user: any) => user.id === myId) &&
                !skill.learnedBy.some((user: any) => user.id === myId),
        );

        return [...filteredSkills, ...formattedUsers];
    }
}
