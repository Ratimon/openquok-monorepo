import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const postId = params.postId;

	// Use the SvelteKit-provided fetch so dev HTTPS (self-signed cert) + Vite proxy behave correctly in SSR.
	try {
		const res = await fetch(`/api/v1/posts/preview/${encodeURIComponent(postId)}?share=true`);
		const json = (await res.json()) as {
			success?: boolean;
			data?: {
				id: string;
				postGroup: string;
				publishDateIso: string;
				content: string;
				media: { id: string; path: string }[];
			};
			message?: string;
		};
		if (!res.ok || json?.success !== true || !json.data) {
			return { ok: false as const, error: json?.message || 'Could not load preview.' };
		}
		return { ok: true as const, post: json.data };
	} catch {
		return { ok: false as const, error: 'Could not load preview.' };
	}
};

