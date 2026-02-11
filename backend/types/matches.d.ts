export interface IMatchResponse {
  compatibility: number,
  aiExplanation: string,
  id: string,
  initiatorId: string,
  otherId: string,
  other: {
    id: string;
    name: string | null;
    imageUrl: string | null;
    knownSkills: {
      title: string
    }[],

    skillsToLearn: {
      title: string
    }[],
  }
}

export interface IAvailableMatchItem {
  isFriend: boolean;
  other: {
    id: string;
    name: string | null;
    imageUrl: string | null;
    knownSkills: { id: string; title: string }[];
    skillsToLearn: { id: string; title: string }[];
  }
}
