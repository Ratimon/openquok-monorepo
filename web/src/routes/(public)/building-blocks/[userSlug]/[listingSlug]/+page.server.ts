import { error, redirect } from '@sveltejs/kit';

import { publicExtensionBySlugPagePresenter } from '$lib/area-public';
import { getRootPathPublicCreatorBuildingBlock } from '$lib/area-public/constants/getRootPathPublicCreators';

export const ssr = true;

/** Legacy `/building-blocks/{username}/{slug}` — redirect to `/creators/{username}/building-blocks/{slug}`. */
export async function load({ params, fetch }) {
	const userSlug = params.userSlug;
	const listingSlug = params.listingSlug;

	if (typeof userSlug !== 'string' || !userSlug.trim()) {
		throw error(404, 'Building block not found');
	}
	if (typeof listingSlug !== 'string' || !listingSlug.trim()) {
		throw error(404, 'Building block not found');
	}

	const { extensionVm } = await publicExtensionBySlugPagePresenter.loadExtensionBySlugStateless({
		userSlug,
		slug: listingSlug,
		fetch,
		relatedLimit: 0
	});

	if (!extensionVm) {
		throw error(404, 'Building block not found');
	}

	const ownerUsername = extensionVm.owner?.username?.trim() ?? userSlug;
	redirect(301, `/${getRootPathPublicCreatorBuildingBlock(ownerUsername, extensionVm.slug)}`);
}
