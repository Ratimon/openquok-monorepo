import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
import type { ComposerSnapshotInput } from '$lib/posts/createSocialPost.types';
import type { PostMediaViewModel } from '$lib/posts/Post.repository.svelte';
import { getLaunchProviderConfig } from '$lib/ui/components/posts/providers';
import {
	instagramMaxMediaItems,
	readInstagramLaunchSettings
} from '$lib/ui/components/posts/providers/instagram/instagram.provider';

// --- Channel schedulability ---

export function isChannelSchedulable(
	ch: CreateSocialPostChannelViewModel | null | undefined
): boolean {
	if (!ch) return false;
	if (typeof (ch as { schedulable?: boolean }).schedulable === 'boolean') {
		return (ch as { schedulable: boolean }).schedulable;
	}
	return !ch.disabled && !ch.inBetweenSteps && !ch.refreshNeeded;
}

export function unschedulableReason(
	ch: CreateSocialPostChannelViewModel | null | undefined
): string | null {
	if (!ch) return 'Channel not found.';
	const vmReason = (ch as { unschedulableReason?: string | null }).unschedulableReason;
	if (typeof vmReason === 'string' || vmReason === null) {
		return vmReason ?? null;
	}
	if (ch.disabled) return 'This channel is disabled.';
	if (ch.inBetweenSteps) return 'Finish connecting this channel first.';
	if (ch.refreshNeeded) return 'Reconnect this channel first.';
	return null;
}

/** User-visible prefix for provider validation toasts and inline copy (network + account name). */
export function formatProviderScheduleValidationMessage(
	ch: CreateSocialPostChannelViewModel,
	raw: string
): string {
	const id = (ch.identifier ?? '').toLowerCase();
	const label = (ch.name ?? '').trim() || 'Channel';
	if (id.startsWith('instagram')) {
		return `Instagram (${label}): ${raw}`;
	}
	if (id === 'threads') {
		return `Threads (${label}): ${raw}`;
	}
	return `${label}: ${raw}`;
}

// --- Composer snapshot / dirty check ---

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

// --- Provider settings merge ---

function isPlainSettingsObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Merge a partial provider-settings update into what we already have per integration.
 * Top-level buckets (`threads`, `instagram`, a future `tiktok`, …) are shallow-merged so UI that
 * only emits one subsection does not wipe siblings (e.g. `threads.replies` from the composer).
 * Non-objects (and arrays) are replaced wholesale by `next`, matching normal `{ ...current, ...next }`.
 */
export function mergeProviderSettingsPatch(
	current: Record<string, unknown>,
	next: Record<string, unknown>
): Record<string, unknown> {
	const merged: Record<string, unknown> = { ...current };
	for (const key of Object.keys(next)) {
		const n = next[key];
		const c = current[key];
		if (isPlainSettingsObject(c) && isPlainSettingsObject(n)) {
			merged[key] = { ...c, ...n };
		} else {
			merged[key] = n;
		}
	}
	return merged;
}

/** Deep-clone provider settings for set snapshots (falls back to empty object on failure). */
export function cloneProviderSettingsByIntegrationId(
	source: Record<string, Record<string, unknown>> | undefined
): Record<string, Record<string, unknown>> {
	try {
		return JSON.parse(JSON.stringify(source ?? {})) as Record<string, Record<string, unknown>>;
	} catch {
		return {};
	}
}

// --- Schedule validation ---

/** Tightest main-post attachment cap across selected channels (`null` = no cap in the composer). */
export function computeLaunchMaxMediaItems(args: {
	selectedIds: string[];
	baseSocialChannelsVm: CreateSocialPostChannelViewModel[];
	providerSettingsByIntegrationId: Record<string, Record<string, unknown>>;
}): number | null {
	let cap: number | null = null;
	for (const id of args.selectedIds) {
		const ch = args.baseSocialChannelsVm.find((c) => c.id === id);
		if (!ch) continue;
		const ident = (ch.identifier ?? '').toLowerCase();
		if (!ident.startsWith('instagram')) continue;
		const limit = instagramMaxMediaItems(
			readInstagramLaunchSettings(args.providerSettingsByIntegrationId[id] ?? {})
		);
		cap = cap === null ? limit : Math.min(cap, limit);
	}
	return cap;
}

export function computeScheduleValidationError(args: {
	selectedIds: string[];
	baseSocialChannelsVm: CreateSocialPostChannelViewModel[];
	postMediaItems: PostMediaViewModel[];
	providerSettingsByIntegrationId: Record<string, Record<string, unknown>>;
}): string | null {
	if (!args.selectedIds.length) return null;
	for (const id of args.selectedIds) {
		const ch = args.baseSocialChannelsVm.find((c) => c.id === id);
		if (!ch) continue;
		const cfg = getLaunchProviderConfig(ch.identifier);
		if (!cfg.checkValidity) continue;
		const res = cfg.checkValidity({
			media: args.postMediaItems,
			settings: args.providerSettingsByIntegrationId[id] ?? {}
		});
		if (typeof res === 'string' && res.trim().length > 0) {
			return formatProviderScheduleValidationMessage(ch, res);
		}
	}
	return null;
}

/** Provider async checks (video duration, etc.) before scheduling. */
export async function computeScheduleValidationErrorAsync(args: {
	selectedIds: string[];
	baseSocialChannelsVm: CreateSocialPostChannelViewModel[];
	postMediaItems: PostMediaViewModel[];
	providerSettingsByIntegrationId: Record<string, Record<string, unknown>>;
}): Promise<string | null> {
	const sync = computeScheduleValidationError(args);
	if (sync) return sync;

	for (const id of args.selectedIds) {
		const ch = args.baseSocialChannelsVm.find((c) => c.id === id);
		if (!ch) continue;
		const cfg = getLaunchProviderConfig(ch.identifier);
		if (!cfg.checkValidityAsync) continue;
		const res = await cfg.checkValidityAsync({
			media: args.postMediaItems,
			settings: args.providerSettingsByIntegrationId[id] ?? {}
		});
		if (typeof res === 'string' && res.trim().length > 0) {
			return formatProviderScheduleValidationMessage(ch, res);
		}
	}
	return null;
}
