import { z } from "zod";

export const signUpSchema = z
  .object({
    email: z.email("Invalid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /(?=.*[a-z])/,
        "Password must contain at least one lowercase letter"
      )
      .regex(
        /(?=.*[A-Z])/,
        "Password must contain at least one uppercase letter"
      )
      .regex(/(?=.*\d)/, "Password must contain at least one number"),
    name: z.string().min(1, "Name is required"),
    confirmPassword: z.string(),
    knownSkills: z.array(z.string()).min(1, "Must be at least 1 skill added"),
    skillsToLearn: z.array(z.string()).min(1, "Must be at least 1 skill added"),
    checkBox: z.boolean().refine((val) => val === true, {
      message: "You must accept Terms and Conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type signUpFormData = z.infer<typeof signUpSchema>;
