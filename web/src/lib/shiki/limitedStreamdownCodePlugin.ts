/**
 * Shared Streamdown code plugin with the curated Shiki language set.
 * Prefer this over the default `code` export (full plugin-core catalog).
 */
import { createCodePlugin } from 'streamdown-svelte';

import { limitedStreamdownLanguages } from '$lib/shiki/limitedLanguages';

export const limitedStreamdownCodePlugin = createCodePlugin({
	languages: limitedStreamdownLanguages
});
