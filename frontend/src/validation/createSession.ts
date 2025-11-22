import { z } from 'zod'



export const createSessionSchema = z.object({
    friendName: z.string().min(1, "Friend name is required"),
    title: z.string().min(1, "Title is required"),
    meetingLink: z.string().optional(),
    friendId: z.string(),
    start: z.string()
        .regex(/^[0-9]+$/, "Must be only numbers")
        .refine((v) => Number(v) >= 0 && Number(v) < 24, {
            message: "Must be valid hour (0–23)",
        }),
    end: z.string()
        .min(1, "Field is required")
        .regex(/^[0-9]+$/, "Must be only numbers")
        .refine((v) => Number(v) >= 0 && Number(v) < 24, {
            message: "Must be valid hour (0–23)",
        }),
    color: z.string().optional().default("#1d4ed8"),
    date: z.string()
        .min(1, "Date is required")
        .refine((v) => !isNaN(Date.parse(v)), {
            message: "Invalid date format",
        }),
    description: z.string().optional(),
}).refine((data) => Number(data.end) > Number(data.start), {
    message: "End hour must be greater than start hour",
    path: ["end"],
});






export type createSessionFormData = z.infer<typeof createSessionSchema>;