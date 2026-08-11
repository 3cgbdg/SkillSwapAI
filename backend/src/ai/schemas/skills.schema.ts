import { z } from 'zod';

export const skillsOutputSchema = z.object({
  skills: z.array(z.string()).min(1).max(10),
});

export type SkillsOutput = z.infer<typeof skillsOutputSchema>;
