export const QUEUE_AI = 'ai';
export const QUEUE_MAINTENANCE = 'maintenance';

export const JOB_GENERATE_MATCH = 'generate-match';
export const JOB_AI_SKILL_SUGGESTIONS = 'ai-skill-suggestions';
export const JOB_AUTO_ACCEPT_FRIENDS = 'auto-accept-friends';
export const JOB_AUTO_ACCEPT_SESSIONS = 'auto-accept-sessions';
export const JOB_PROMPT_SESSION_REVIEWS = 'prompt-session-reviews';

export interface GenerateMatchJobPayload {
  myId: string;
  otherId: string;
  jobId: string;
}

export interface AiSkillSuggestionsJobPayload {
  userId: string;
}
