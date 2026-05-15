import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getCliAuthServerUrl } from '$lib/cli-auth/server';

export const load: PageServerLoad = async ({ url }) => {
	const code = url.searchParams.get('code')?.trim().toUpperCase() ?? '';
	return { prefilledCode: code };
};

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const userCode = String(formData.get('user_code') ?? '')
			.toUpperCase()
			.trim();

		if (!userCode) {
			return fail(400, { error: 'Please enter the code from your terminal.', userCode: '' });
		}

		const authServer = getCliAuthServerUrl();
		const res = await fetch(`${authServer}/device/verify`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ user_code: userCode }),
			redirect: 'manual'
		});

		if (res.status >= 300 && res.status < 400) {
			const location = res.headers.get('location');
			if (location) redirect(302, location);
		}

		return fail(400, {
			error: 'Invalid or expired code. Start a new login from the CLI and try again.',
			userCode
		});
	}
} satisfies Actions;
