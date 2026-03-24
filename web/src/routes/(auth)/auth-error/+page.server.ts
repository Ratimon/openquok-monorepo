import type { PageServerLoad } from './$types';

export const ssr = false;

export const load: PageServerLoad = async ({ url }) => {
	const message = url.searchParams.get('message') ?? 'An error occurred with your authentication.';
	return { errorMessage: message };
};
