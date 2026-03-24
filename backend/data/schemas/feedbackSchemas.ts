import { z } from "zod";

export const feedbackSchema = z.object({
    feedback_type: z.enum(["propose", "report", "feedback"]),
    url: z.string().url("Invalid URL").min(3),
    description: z.string().min(10, "Description must be at least 10 characters"),
    email: z
        .string()
        .optional()
        .refine((v) => v === undefined || v === "" || (v.length >= 2 && v.includes("@")), {
            message: "Email must be valid if provided",
        }),
});

export type FeedbackSchemaType = z.infer<typeof feedbackSchema>;
