import { ModuleStatus } from "@prisma/client"


export interface IGeneratedActiveMatch {
    compatibility: number,
    aiExplanation: string,
    id: string,
    keyBenefits: ['...', '...', '...', '...']
    modules: 
        {
            title: 'Foundations of JavaScript - Variables & Data Types'
            status: ModuleStatus,
            objectives: string[],
            activities: string[],
            timeline: number,
            resources:
            {
                title: string,
                description: string,
                link: string
            }[]
        }[]
    
}