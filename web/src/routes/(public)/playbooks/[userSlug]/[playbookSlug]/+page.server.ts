import { error, redirect } from '@sveltejs/kit';

import { publicStackBySlugPagePresenter } from '$lib/area-public';
import { getRootPathPublicCreatorPlaybook } from '$lib/area-public/constants/getRootPathPublicCreators';

export const ssr = true;

/** Legacy `/playbooks/{username}/{slug}` — redirect to `/creators/{username}/playbooks/{slug}`. */
export async function load({ params, fetch }) {
	const userSlug = params.userSlug;
	const playbookSlug = params.playbookSlug;
	if (typeof userSlug !== 'string' || !userSlug.trim()) {
		throw error(404, 'Playbook not found');
	}
	if (typeof playbookSlug !== 'string' || !playbookSlug.trim()) {
		throw error(404, 'Playbook not found');
	}

	const stackVm = await publicStackBySlugPagePresenter.loadStackBySlugStateless({
		userSlug,
		slug: playbookSlug,
		fetch
	});
	if (!stackVm) {
		throw error(404, 'Playbook not found');
	}

	const ownerUsername = stackVm.owner?.username?.trim() ?? userSlug;
	redirect(301, `/${getRootPathPublicCreatorPlaybook(ownerUsername, stackVm.slug)}`);
}
