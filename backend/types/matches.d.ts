export interface IMatchResponse {
  compatibility: number,
  aiExplanation: string,
  id: string,
  initiatorId: string,
  otherId: string,
  other: {
    knownSkills: {
      title: string
    }[],

    skillsToLearn: {
      title: string
    }[],
  }
}
