import { IMatchResponse, IAvailableMatchItem } from 'types/matches';

export class MatchesUtils {
    static userSelect() {
        return {
            select: {
                id: true,
                name: true,
                imageUrl: true,
                knownSkills: { select: { title: true } },
                skillsToLearn: { select: { title: true } },
            },
        };
    }

    static mapToMatchResponse(match: any, myId: string): IMatchResponse {
        const otherUser = match.initiator.id === myId ? match.other : match.initiator;
        return {
            ...match,
            other: otherUser,
        };
    }

    static mapToAvailableMatch(user: any): IAvailableMatchItem {
        return {
            isFriend: user.friendOf.length > 0 || user.friends.length > 0,
            other: {
                id: user.id,
                name: user.name,
                imageUrl: user.imageUrl,
                knownSkills: user.knownSkills,
                skillsToLearn: user.skillsToLearn,
            },
        };
    }

    static buildAvailableMatchesFilter(myId: string, learnTitles: string[], knowTitles: string[]) {
        return {
            AND: [
                {
                    OR: [
                        { knownSkills: { some: { title: { in: learnTitles } } } },
                        { skillsToLearn: { some: { title: { in: knowTitles } } } },
                        { friendOf: { some: { OR: [{ user1Id: myId }, { user2Id: myId }] } } },
                        { friends: { some: { OR: [{ user1Id: myId }, { user2Id: myId }] } } },
                    ],
                },
            ],
            NOT: [
                { id: myId },
                { matchesInitiated: { some: { otherId: myId } } },
                { matchesReceived: { some: { initiatorId: myId } } },
            ],
        };
    }

    static getMatchFilter(id1: string, id2: string) {
        return {
            OR: [
                { AND: [{ initiatorId: id1 }, { otherId: id2 }] },
                { AND: [{ initiatorId: id2 }, { otherId: id1 }] },
            ],
        };
    }
}
