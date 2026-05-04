import { ModuleStatus } from '../prisma/prisma-exports.js';

export interface IGeneratedActiveMatch {
  compatibility: number;
  aiExplanation: string;
  id: string;
  keyBenefits: string[];
  modules: {
    title: string;
    status: ModuleStatus;
    objectives: string[];
    activities: string[];
    timeline: number;
    resources: {
      title: string;
      description: string;
      link: string;
    }[];
  }[];
}
