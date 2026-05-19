import type { PostRowProgrammerModel } from '$lib/posts/Post.repository.svelte';
import type { PostKanbanRowViewModel } from '$lib/posts/postKanbanBoard.types';

/** Maps list/flip/review API rows to kanban list view models. */
export function toPostKanbanRowVm(pm: PostRowProgrammerModel): PostKanbanRowViewModel {
	return {
		id: pm.id,
		postGroup: pm.postGroup,
		state: pm.state,
		publishDate: pm.publishDate,
		organizationId: pm.organizationId,
		integrationId: pm.integrationId,
		content: pm.content,
		intervalInDays: pm.intervalInDays,
		repeatInterval: pm.repeatInterval,
		error: pm.error,
		channelName: pm.channelName,
		channelPictureUrl: pm.channelPictureUrl,
		providerIdentifier: pm.providerIdentifier,
		note: pm.note ?? null,
		isAgentEdited: pm.isAgentEdited ?? false,
		isReviewed: pm.isReviewed ?? false,
		tagNames: Array.isArray(pm.tagNames) ? pm.tagNames : []
	};
}

export function toPostKanbanRowsVm(rowsPm: PostRowProgrammerModel[]): PostKanbanRowViewModel[] {
	return rowsPm.map(toPostKanbanRowVm);
}
