import { z } from 'zod';

/** Forgot / reset password: email step. */
export const resetPasswordEmailSchema = z.string().email('Please enter a valid email.').trim();

/** Supabase recovery OTP length (email may show 6–8 digits). */
export const RESET_PASSWORD_CODE_MIN_LENGTH = 6;
export const RESET_PASSWORD_CODE_MAX_LENGTH = 8;

/** Forgot / reset password: OTP from email (Supabase recovery codes are 6–8 digits). */
export const resetPasswordCodeSchema = z
	.string()
	.min(RESET_PASSWORD_CODE_MIN_LENGTH, `Code must be at least ${RESET_PASSWORD_CODE_MIN_LENGTH} digits.`)
	.max(RESET_PASSWORD_CODE_MAX_LENGTH, `Code must be at most ${RESET_PASSWORD_CODE_MAX_LENGTH} digits.`)
	.regex(/^\d+$/, 'Code must be digits only.')
	.trim();

export const signinFormSchema = z.object({
	email: z.string().email('Please enter a valid email.').trim(),
	password: z.string().min(8, 'Password must be at least 8 characters.').max(72).trim()
});

export type SigninFormSchemaType = z.infer<typeof signinFormSchema>;

/** Object shape used for field-level access (e.g. resend-email email check). Prefer `signupFormSchema` for full validation including password match. */
export const signupFormFieldsSchema = z.object({
	fullName: z.string().trim().min(2, 'Full name must be at least 2 characters.'),
	email: z.string().email('Please enter a valid email.').trim(),
	password: z
		.string()
		.min(8, 'At least 8 characters.')
		.regex(/[a-zA-Z]/, 'At least one letter.')
		.regex(/[0-9]/, 'At least one number.')
		.max(72)
		.trim(),
	confirmPassword: z.string().trim().min(1, 'Please confirm your password.')
});

export const signupFormSchema = signupFormFieldsSchema.refine(
	(data) => data.password === data.confirmPassword,
	{ message: 'Passwords do not match.', path: ['confirmPassword'] }
);

export type SignupFormSchemaType = z.infer<typeof signupFormFieldsSchema>;
