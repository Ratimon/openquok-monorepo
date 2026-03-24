import { z } from 'zod';

/** Forgot / reset password: email step. */
export const resetPasswordEmailSchema = z.string().email('Please enter a valid email.').trim();

/** Forgot / reset password: 6-digit OTP from email. */
export const resetPasswordCodeSchema = z
	.string()
	.min(6, 'Code must be 6 characters.')
	.max(6, 'Code must be 6 characters.')
	.regex(/^\d+$/, 'Code must be 6 digits.')
	.trim();

export const signinFormSchema = z.object({
	email: z.string().email('Please enter a valid email.').trim(),
	password: z.string().min(8, 'Password must be at least 8 characters.').max(72).trim()
});

export type SigninFormSchemaType = z.infer<typeof signinFormSchema>;

export const signupFormSchema = z.object({
	fullName: z.string().trim().min(2, 'Full name must be at least 2 characters.'),
	email: z.string().email('Please enter a valid email.').trim(),
	password: z
		.string()
		.min(8, 'At least 8 characters.')
		.regex(/[a-zA-Z]/, 'At least one letter.')
		.regex(/[0-9]/, 'At least one number.')
		.max(72)
		.trim()
});

export type SignupFormSchemaType = z.infer<typeof signupFormSchema>;
