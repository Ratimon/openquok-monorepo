import { accountUsernameFormSchema } from '$lib/account/account.types';

/** Suggest a valid creator slug from an email local part, or empty when not usable. */
export function suggestUsernameFromEmail(email: string): string {
	const local = email.split('@')[0]?.trim().toLowerCase() ?? '';
	const sanitized = local
		.replace(/[^a-z0-9-]/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '');
	if (!sanitized) return '';
	return accountUsernameFormSchema.shape.username.safeParse(sanitized).success ? sanitized : '';
}
