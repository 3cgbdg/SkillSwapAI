import { z } from 'zod'



export const editProfileSchema = z.object({
    email: z.email("Invalid email"),
    name: z.string().min(1),
    bio: z.string().optional(),
});



export type editProfileFormData = z.infer<typeof editProfileSchema>;