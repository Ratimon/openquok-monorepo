import type { ComposerSnapshotInput } from '$lib/posts/createSocialPost.types';

export function serializeComposerSnapshot(input: ComposerSnapshotInput): string {
	return JSON.stringify({
		mode: input.mode,
		focusedIntegrationId: input.focusedIntegrationId,
		selectedGroupId: input.selectedGroupId,
		globalBody: input.globalBody,
		bodiesByIntegrationId: input.bodiesByIntegrationId,
		editorBody: input.editorBody,
		postMediaItems: input.postMediaItems,
		selectedIds: input.selectedIds,
		scheduledLocal: input.scheduledLocal,
		repeatInterval: input.repeatInterval,
		selectedTagNames: input.selectedTagNames,
		...(input.contentSetAuthoringActive ? { sharedFollowUpReplies: input.sharedFollowUpReplies } : {})
	});
}

export function isComposerDirty(initialSnapshot: string, input: ComposerSnapshotInput): boolean {
	if (initialSnapshot === '') return false;
	return serializeComposerSnapshot(input) !== initialSnapshot;
}
