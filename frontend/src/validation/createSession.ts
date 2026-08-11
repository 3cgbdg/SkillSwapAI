import { z } from "zod";

const colorKeys = [
  "plum",
  "amber",
  "sage",
  "coral",
  "slate",
  "violet",
] as const;

export const createSessionSchema = z
  .object({
    friendName: z.string().min(1, "Friend name is required"),
    title: z.string().min(1, "Title is required"),
    meetingLink: z.string().optional(),
    friendId: z.string().optional(),
    startsAt: z.string().min(1, "Start time is required"),
    endsAt: z.string().min(1, "End time is required"),
    timeZone: z.string().min(1, "Timezone is required"),
    color: z.enum(colorKeys).default("plum"),
    description: z.string().optional(),
  })
  .refine(
    (data) =>
      new Date(data.endsAt).getTime() > new Date(data.startsAt).getTime(),
    {
      message: "End time must be after start time",
      path: ["endsAt"],
    }
  );

export type createSessionFormData = z.infer<typeof createSessionSchema>;
