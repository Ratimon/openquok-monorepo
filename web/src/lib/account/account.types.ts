import { z } from 'zod';

export const accountChangePasswordFormSchema = z
	.object({
		newPassword: z.string().min(8, 'Password must be at least 8 characters long.').max(72).trim(),
		confirmPassword: z.string().trim()
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Passwords do not match.',
		path: ['confirmPassword']
	});

export type AccountChangePasswordFormSchemaType = z.infer<typeof accountChangePasswordFormSchema>;

export const accountFullNameFormSchema = z.object({
	fullName: z.string().trim().min(1, 'Full name is required.')
});

export type AccountFullNameFormSchemaType = z.infer<typeof accountFullNameFormSchema>;

/** Profile picture (storage path) only — used in account settings avatar form. */
export const accountAvatarDetailsFormSchema = z.object({
	avatarUrl: z.string()
});

export type AccountAvatarDetailsFormSchemaType = z.infer<typeof accountAvatarDetailsFormSchema>;

/** Public website URL — used in account settings website dialog. */
export const accountWebsiteFormSchema = z.object({
	websiteUrl: z
		.string()
		.max(2048)
		.trim()
		.refine((v) => v === '' || /^https?:\/\//i.test(v), {
			message: 'Enter a valid http(s) URL or leave empty.'
		})
});

export type AccountWebsiteFormSchemaType = z.infer<typeof accountWebsiteFormSchema>;

/** Public creator username for `/creators/{username}` and listing URLs. */
export const accountUsernameFormSchema = z.object({
	username: z
		.string()
		.min(3, 'Username must be at least 3 characters.')
		.max(30, 'Username must be at most 30 characters.')
		.regex(/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/, {
			message: 'Username must use lowercase letters, numbers, and hyphens only.'
		})
		.trim()
});

export type AccountUsernameFormSchemaType = z.infer<typeof accountUsernameFormSchema>;

/** Combined avatar + website (legacy / tooling). Prefer accountAvatarDetailsFormSchema + accountWebsiteFormSchema. */
export const accountProfileDetailsFormSchema = accountAvatarDetailsFormSchema.merge(accountWebsiteFormSchema);

export type AccountProfileDetailsFormSchemaType = z.infer<typeof accountProfileDetailsFormSchema>;
