import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
import type { CrossAccountPlugState } from '$lib/posts/utils/create-post';

export type CrossAccountPlugPreviewItem = {
	id: string;
	kind: 'comment' | 'repost';
	actorName: string;
	actorPicture: string | null;
	message: string;
	delayMs: number;
	label: string;
};

type PlugDefinitionRef = {
	identifier: string;
	title: string;
};

function inferPlugKind(plugName: string): 'comment' | 'repost' {
	const key = plugName.toLowerCase();
	if (key.includes('comment') || key.includes('add-comment')) return 'comment';
	return 'repost';
}

/** Build preview rows for enabled cross-account plugs (composer + landing mocks). */
export function buildCrossAccountPlugPreviewItems(
	channels: CreateSocialPostChannelViewModel[],
	plugs: CrossAccountPlugState[] | undefined,
	plugDefs: PlugDefinitionRef[] = []
): CrossAccountPlugPreviewItem[] {
	if (!plugs?.length) return [];

	const items: CrossAccountPlugPreviewItem[] = [];

	for (const plug of plugs) {
		if (!plug.enabled || !plug.integrationIds.length) continue;

		const def = plugDefs.find((entry) => entry.identifier === plug.plugName);
		const label = def?.title ?? 'Cross-account plug';
		const kind = inferPlugKind(plug.plugName);
		const commentText = String(plug.fields?.comment ?? '').trim();

		for (const integrationId of plug.integrationIds) {
			const channel = channels.find((ch) => ch.id === integrationId);
			if (!channel) continue;

			items.push({
				id: `${plug.plugName}-${integrationId}`,
				kind,
				actorName: channel.name,
				actorPicture: channel.picture ?? null,
				message: kind === 'comment' ? commentText : '',
				delayMs: plug.delayMs ?? 0,
				label
			});
		}
	}

	return items;
}

export function formatCrossAccountPlugDelayLabel(delayMs: number): string {
	const seconds = Math.max(0, Math.floor(delayMs / 1000));
	if (seconds === 0) return 'After publish';
	if (seconds < 60) return `After ${seconds}s`;
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `After ${minutes} min`;
	const hours = Math.floor(minutes / 60);
	return `After ${hours} h`;
}
