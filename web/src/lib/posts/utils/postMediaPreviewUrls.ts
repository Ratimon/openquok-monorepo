import type { PostMediaProgrammerModel } from '$lib/posts/Post.repository.svelte';

import { publicUrlForMediaStorageKey } from '$lib/medias/utils/mediaUrls';

/** Preview `src` for composer media: local blob URLs first, then public storage URLs. */
export function postMediaPreviewUrls(items: readonly PostMediaProgrammerModel[]): string[] {
	return items.map((m) => {
		const local = m.localPreviewUrl?.trim();
		if (local) return local;
		const path = m.path.trim();
		if (path.startsWith('blob:')) return path;
		return publicUrlForMediaStorageKey(path);
	});
}
