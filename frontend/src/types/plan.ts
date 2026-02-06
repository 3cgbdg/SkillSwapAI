
export type ModuleStatusType = "LOCKED" | "AVAILABLE" | "COMPLETED";

export interface IGeneratedModule {
    id: string;
    title: string;
    status: ModuleStatusType;
    objectives: string[];
    activities: string[];
    timeline: number;
    resources: {
        id: string;
        title: string;
        description?: string;
        link: string;
    }[];
}

export interface IGeneratedPlan {
    id: string;
    modules: IGeneratedModule[];
}
