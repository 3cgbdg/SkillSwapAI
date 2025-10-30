//types and interfaces

interface IAiReportAnalyzedMatch {
  compatibility: number,
  aiExplanation: string,
  id?: string,
  keyBenefits: string[],
}

interface IAiReportGeneratedPlan {
  modules: {
    title: string,
    status: ModuleStatus,
    objectives: string[],
    activities: string[],
    timeline: number,
    resources: {
      title: string,
      description?: string,
      link: string
    }[]
  }[]
}

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