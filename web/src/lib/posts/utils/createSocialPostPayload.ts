import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
import type { CreateSocialPostMode } from '$lib/posts/createSocialPost.types';
import type {
	CreatePostProgrammerModel,
	PostMediaViewModel,
	RepeatIntervalKey
} from '$lib/posts/Post.repository.svelte';
import { isChannelSchedulable, unschedulableReason } from '$lib/posts/utils/createSocialPostChannel';
import { datetimeLocalToIso } from '$lib/utils/postingSchedulePreferences';
import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';

export type ComposerContentValidationResult =
	| { ok: true; plain: string; hasText: boolean; hasMedia: boolean }
	| { ok: false; error: string };

export function validateComposerContent(args: {
	editorBody: string;
	postMediaItems: PostMediaViewModel[];
	minimumCharacters: number;
	softCharLimit: number;
}): ComposerContentValidationResult {
	const plain = stripHtmlToPlainText(args.editorBody);
	const hasText = plain.length > 0;
	const hasMedia = args.postMediaItems.length > 0;
	if (!hasText && !hasMedia) {
		return { ok: false, error: 'Write something or attach at least one image.' };
	}
	if (hasText && plain.length < args.minimumCharacters) {
		return { ok: false, error: `Please add at least ${args.minimumCharacters} characters.` };
	}
	if (plain.length > args.softCharLimit) {
		return {
			ok: false,
			error: `Too long for this mode (${plain.length}/${args.softCharLimit}).`
		};
	}
	return { ok: true, plain, hasText, hasMedia };
}

export type BuildPostUpsertPayloadInput = {
	workspaceId: string;
	mode: CreateSocialPostMode;
	globalBody: string;
	bodiesByIntegrationId: Record<string, string>;
	focusedIntegrationId: string | null;
	editorBody: string;
	providerSettingsByIntegrationId: Record<string, Record<string, unknown>>;
	postMediaItems: PostMediaViewModel[];
	selectedIds: string[];
	scheduledLocal: string;
	repeatInterval: RepeatIntervalKey | null;
	selectedTagNames: string[];
	status: 'draft' | 'scheduled';
};

/** Session payload for create/update post group (draft or scheduled). */
export function buildPostUpsertPayload(input: BuildPostUpsertPayloadInput): CreatePostProgrammerModel {
	const overrides = input.mode === 'custom' ? input.bodiesByIntegrationId : undefined;
	return {
		organizationId: input.workspaceId,
		body: input.globalBody,
		...(overrides ? { bodiesByIntegrationId: overrides } : {}),
		...(Object.keys(input.providerSettingsByIntegrationId ?? {}).length
			? { providerSettingsByIntegrationId: input.providerSettingsByIntegrationId }
			: {}),
		...(input.postMediaItems.length ? { media: input.postMediaItems } : {}),
		integrationIds: input.selectedIds,
		isGlobal: input.mode === 'global',
		scheduledAt: datetimeLocalToIso(input.scheduledLocal),
		repeatInterval: input.repeatInterval,
		tagNames: input.selectedTagNames,
		status: input.status
	};
}

export type ProgrammaticPayloadPreviewInput = BuildPostUpsertPayloadInput & {
	scheduleValidationError: string | null;
	baseSocialChannelsVm: CreateSocialPostChannelViewModel[];
	minimumCharacters: number;
	softCharLimit: number;
};

/**
 * Build a programmatic (public API) create-post payload preview for the current composer state.
 * Matches backend `{api.prefix}/public/posts` schemas: organization id is derived from the token/key.
 */
export function buildProgrammaticCreatePostPayloadPreview(
	input: ProgrammaticPayloadPreviewInput,
	status: CreatePostProgrammerModel['status']
):
	| { ok: true; payload: Omit<CreatePostProgrammerModel, 'organizationId'> }
	| { ok: false; error: string } {
	if (!input.workspaceId) return { ok: false, error: 'Select a workspace.' };
	if (input.selectedIds.length === 0) return { ok: false, error: 'Select at least one channel.' };
	if (!input.scheduledLocal.trim()) return { ok: false, error: 'Pick a schedule time.' };

	const content = validateComposerContent({
		editorBody: input.editorBody,
		postMediaItems: input.postMediaItems,
		minimumCharacters: input.minimumCharacters,
		softCharLimit: input.softCharLimit
	});
	if (!content.ok) return { ok: false, error: content.error };

	const scheduledAt = datetimeLocalToIso(input.scheduledLocal);
	if (!scheduledAt) return { ok: false, error: 'Schedule time is invalid.' };

	if (status === 'scheduled') {
		for (const id of input.selectedIds) {
			const ch = input.baseSocialChannelsVm.find((c) => c.id === id);
			if (!isChannelSchedulable(ch)) {
				return { ok: false, error: unschedulableReason(ch) ?? 'Reconnect this channel first.' };
			}
		}
		if (input.scheduleValidationError) {
			return { ok: false, error: input.scheduleValidationError };
		}
	}

	const body = input.mode === 'global' ? input.editorBody : input.globalBody;
	const overrides =
		input.mode === 'custom' && input.focusedIntegrationId
			? { ...input.bodiesByIntegrationId, [input.focusedIntegrationId]: input.editorBody }
			: input.mode === 'custom'
				? input.bodiesByIntegrationId
				: undefined;

	const sessionPayload: CreatePostProgrammerModel = {
		organizationId: input.workspaceId,
		body,
		...(overrides ? { bodiesByIntegrationId: overrides } : {}),
		...(Object.keys(input.providerSettingsByIntegrationId ?? {}).length
			? { providerSettingsByIntegrationId: input.providerSettingsByIntegrationId }
			: {}),
		...(input.postMediaItems.length ? { media: input.postMediaItems } : {}),
		integrationIds: input.selectedIds,
		isGlobal: input.mode === 'global',
		scheduledAt,
		repeatInterval: input.repeatInterval,
		tagNames: input.selectedTagNames,
		status
	};

	const { organizationId: _omit, ...programmatic } = sessionPayload;
	return { ok: true, payload: programmatic };
}
