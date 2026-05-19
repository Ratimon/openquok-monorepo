import type { PostMediaViewModel, RepeatIntervalKey } from '$lib/posts/Post.repository.svelte';
import type { SetSharedFollowUpReplyViewModel, SetSnapshotViewModel } from '$lib/sets/GetSet.presenter.svelte';

export type CreateSocialPostMode = 'global' | 'custom';

export type CreateSocialPostPrepareOpenOptions = {
	preselectIntegrationId: string | null;
	preselectGroupId?: string | null;
	/** Optional UTC ISO-ish schedule time to seed the composer with (calendar cell click). */
	preselectScheduledAtIso?: string | null;
	/**
	 * Calendar page: multi-select targeted channels (may span multiple groups or include ungrouped).
	 * When it resolves to a single workspace group, `selectedGroupId` will be set automatically.
	 */
	preselectIntegrationIds?: string[] | null;
	/** When true, immediately focus the first selected channel for per-channel editing. */
	autoCustomizeFirstSelected?: boolean;
	/** Restore a saved workspace “set” (channels + composer fields) after load. */
	setSnapshot?: SetSnapshotViewModel | null;
	/** Settings: define a reusable preset; optional `editingSetId` / `editingSetName` for update. */
	contentSetAuthoring?: { editingSetId?: string | null; editingSetName?: string | null } | null;
};

/** Fields serialized for dirty-state comparison and initial snapshot capture. */
export type ComposerSnapshotInput = {
	mode: CreateSocialPostMode;
	focusedIntegrationId: string | null;
	selectedGroupId: string | null;
	globalBody: string;
	bodiesByIntegrationId: Record<string, string>;
	editorBody: string;
	postMediaItems: PostMediaViewModel[];
	selectedIds: string[];
	scheduledLocal: string;
	repeatInterval: RepeatIntervalKey | null;
	selectedTagNames: string[];
	contentSetAuthoringActive: boolean;
	sharedFollowUpReplies: SetSharedFollowUpReplyViewModel[];
};

export type ThreadFollowUpReply = {
	id: string;
	message: string;
	delaySeconds: number;
};

export type CreateSocialPostPendingOpenState = {
	preselectIntegrationId: string | null;
	preselectGroupId: string | null;
	preselectScheduledAtIso: string | null;
	preselectIntegrationIds: string[] | null;
	autoCustomizeFirstSelected: boolean;
	editPostGroup: string | null;
	duplicatePostGroup: string | null;
	setSnapshot: SetSnapshotViewModel | null;
	contentSetAuthoring: { editingSetId?: string | null; editingSetName?: string | null } | null;
};

export function createEmptyPendingOpenState(): CreateSocialPostPendingOpenState {
	return {
		preselectIntegrationId: null,
		preselectGroupId: null,
		preselectScheduledAtIso: null,
		preselectIntegrationIds: null,
		autoCustomizeFirstSelected: false,
		editPostGroup: null,
		duplicatePostGroup: null,
		setSnapshot: null,
		contentSetAuthoring: null
	};
}
