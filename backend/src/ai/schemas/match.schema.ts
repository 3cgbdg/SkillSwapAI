import { z } from 'zod';

const resourceSchema = z.object({
  title: z.string(),
  description: z.string().optional().default(''),
  link: z.string(),
});

const moduleSchema = z.object({
  title: z.string(),
  status: z.enum(['INPROGRESS', 'COMPLETED']).default('INPROGRESS'),
  objectives: z.array(z.string()).min(1),
  activities: z.array(z.string()).min(1),
  timeline: z.number(),
  resources: z.array(resourceSchema).min(1),
});

export const matchOutputSchema = z.object({
  compatibility: z.number().min(0).max(100),
  aiExplanation: z.string(),
  id: z.string(),
  keyBenefits: z.array(z.string()).min(1),
  modules: z.array(moduleSchema).min(4),
});

export type MatchOutput = z.infer<typeof matchOutputSchema>;
