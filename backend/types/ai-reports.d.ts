export interface IAiReportAnalyzedMatch {
  compatibility: number;
  aiExplanation: string;
  id?: string;
  keyBenefits: string[];
}

export interface IAiReportGeneratedPlan {
  modules: {
    title: string;
    status: string;
    objectives: string[];
    activities: string[];
    timeline: number;
    resources: {
      title: string;
      description?: string;
      link: string;
    }[];
  }[];
}
