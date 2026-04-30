import { route } from '$lib/utils/path';

/** Public SvelteKit route where providers redirect after OAuth (no `(protected)` layout). */
export function integrationOAuthCallbackPath(provider: string): string {
	return route(`/integration/oauth/${encodeURIComponent(provider)}`);
}
