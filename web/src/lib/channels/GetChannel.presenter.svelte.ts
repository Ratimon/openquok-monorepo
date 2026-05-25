import type { ConnectedIntegrationProgrammerModel } from '$lib/integrations/Integrations.repository.svelte';

/** One scheduled posting slot: minutes after midnight (0–1439), matching `integrations.posting_times` JSON. */
export type PostingTimeSlotViewModel = { time: number };

/** Workspace channel group row (id + display name) for home lists and assignment. */
export type WorkspaceChannelGroupViewModel = { id: string; name: string };

/**
 * Connected channel row for home / composer UI. No repository DTO shape.
 */
export interface CreateSocialPostChannelViewModel {
	id: string;
	internalId: string;
	name: string;
	identifier: string;
	/** Raw provider/profile picture URL from the API (may be an Instagram CDN URL). */
	picture: string | null;
	type: string;
	disabled: boolean;
	inBetweenSteps: boolean;
	refreshNeeded: boolean;
	/** Whether this channel can be scheduled/published right now (UI gating). */
	schedulable: boolean;
	/** Short UI message explaining why a channel cannot be scheduled. */
	unschedulableReason: string | null;
	/** Workspace channel group this channel belongs to, if any. */
	group: WorkspaceChannelGroupViewModel | null;
	/** Parsed `posting_times` from the API (deduplicated, sorted by `time`). */
	postingTimes: PostingTimeSlotViewModel[];
}

/** Collapsible menu section on the account home (grouped by channel `type`). */
export interface HomeConnectedChannelMenuGroupViewModel {
	label: string;
	items: CreateSocialPostChannelViewModel[];
}

/** One row per integration provider (`identifier`): platform icon + its connected channels. */
export interface HomePlatformChannelRowViewModel {
	identifier: string;
	items: CreateSocialPostChannelViewModel[];
}

/** Channels assigned to the same workspace channel group (sidebar section). */
export interface HomeChannelGroupViewModel {
	id: string;
	name: string;
	items: CreateSocialPostChannelViewModel[];
	/** One row per integration `identifier` (icon + chips + Add more), scoped to this group's channels. */
	platformRows: HomePlatformChannelRowViewModel[];
}

/** Connected channels section layout on the account home. */
export type HomeChannelsLayoutModeViewModel = 'chips' | 'table';

const MINUTES_PER_DAY = 24 * 60;

const HOME_PLATFORM_ROW_ORDER: readonly string[] = [
	'threads',
	'instagram-business',
	'instagram-standalone',
	'facebook',
	'x',
	'youtube',
	'tiktok'
];

type ChannelGroupAcc = WorkspaceChannelGroupViewModel & { items: CreateSocialPostChannelViewModel[] };

/**
 * Stateless PM → VM mapping for connected integrations (home, composer, calendar, etc.).
 */
export class GetChannelPresenter {
	/** Normalizes list API `time` payloads into unique minute-of-day values. */
	parsePostingTimeSlots(raw: unknown): PostingTimeSlotViewModel[] {
		if (!Array.isArray(raw)) return [];
		const seen = new Set<number>();
		const out: PostingTimeSlotViewModel[] = [];
		for (const item of raw) {
			if (!item || typeof item !== 'object') continue;
			const t = Number((item as Record<string, unknown>).time);
			if (!Number.isFinite(t)) continue;
			let m = Math.round(t) % MINUTES_PER_DAY;
			if (m < 0) m += MINUTES_PER_DAY;
			if (seen.has(m)) continue;
			seen.add(m);
			out.push({ time: m });
		}
		out.sort((a, b) => a.time - b.time);
		return out;
	}

	toCreateSocialPostChannelViewModel(pm: ConnectedIntegrationProgrammerModel): CreateSocialPostChannelViewModel {
		const disabled = pm.disabled;
		const inBetweenSteps = pm.inBetweenSteps;
		const refreshNeeded = pm.refreshNeeded;
		const schedulable = !disabled && !inBetweenSteps && !refreshNeeded;
		const unschedulableReason = (() => {
			if (disabled) return 'This channel is disabled.';
			if (inBetweenSteps) return 'Finish connecting this channel first.';
			if (refreshNeeded) return 'Reconnect this channel first.';
			return null;
		})();
		return {
			id: pm.id,
			internalId: pm.internalId,
			name: pm.name,
			identifier: pm.identifier,
			picture: pm.picture,
			type: pm.type,
			disabled,
			inBetweenSteps,
			refreshNeeded,
			schedulable,
			unschedulableReason,
			group: pm.group ?? null,
			postingTimes: this.parsePostingTimeSlots(pm.time)
		};
	}

	buildHomeChannelMenuGroupsVm(
		channels: readonly CreateSocialPostChannelViewModel[]
	): HomeConnectedChannelMenuGroupViewModel[] {
		const map = new Map<string, CreateSocialPostChannelViewModel[]>();
		for (const item of channels) {
			const key = this.labelForHomeChannelGroupType(item.type);
			if (!map.has(key)) map.set(key, []);
			map.get(key)!.push(item);
		}
		const groups: HomeConnectedChannelMenuGroupViewModel[] = [];
		for (const [label, items] of map.entries()) {
			const sorted = [...items].sort((a, b) =>
				(a.name || a.identifier).localeCompare(b.name || b.identifier, undefined, { sensitivity: 'base' })
			);
			groups.push({ label, items: sorted });
		}
		groups.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
		return groups;
	}

	buildPlatformChannelRowsVm(
		channels: readonly CreateSocialPostChannelViewModel[]
	): HomePlatformChannelRowViewModel[] {
		const map = new Map<string, CreateSocialPostChannelViewModel[]>();
		for (const ch of channels) {
			const key = ch.identifier?.trim() || 'unknown';
			if (!map.has(key)) map.set(key, []);
			map.get(key)!.push(ch);
		}
		const rows: HomePlatformChannelRowViewModel[] = [];
		for (const [identifier, items] of map.entries()) {
			const sorted = [...items].sort((a, b) =>
				(a.name || a.identifier).localeCompare(b.name || b.identifier, undefined, { sensitivity: 'base' })
			);
			rows.push({ identifier, items: sorted });
		}
		rows.sort((a, b) => {
			const ia = HOME_PLATFORM_ROW_ORDER.indexOf(a.identifier);
			const ib = HOME_PLATFORM_ROW_ORDER.indexOf(b.identifier);
			const sa = ia === -1 ? 999 : ia;
			const sb = ib === -1 ? 999 : ib;
			if (sa !== sb) return sa - sb;
			return a.identifier.localeCompare(b.identifier, undefined, { sensitivity: 'base' });
		});
		return rows;
	}

	buildChannelGroupSectionsVm(
		channels: readonly CreateSocialPostChannelViewModel[]
	): HomeChannelGroupViewModel[] {
		const map = new Map<string, ChannelGroupAcc>();
		for (const ch of channels) {
			if (!ch.group) continue;
			if (!map.has(ch.group.id)) {
				map.set(ch.group.id, { id: ch.group.id, name: ch.group.name, items: [] });
			}
			map.get(ch.group.id)!.items.push(ch);
		}
		const groups: HomeChannelGroupViewModel[] = [];
		for (const g of map.values()) {
			g.items.sort((a, b) =>
				(a.name || a.identifier).localeCompare(b.name || b.identifier, undefined, { sensitivity: 'base' })
			);
			groups.push({
				id: g.id,
				name: g.name,
				items: g.items,
				platformRows: this.buildPlatformChannelRowsVm(g.items)
			});
		}
		groups.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
		return groups;
	}

	private labelForHomeChannelGroupType(type: string | undefined): string {
		const t = type?.trim() ?? '';
		if (!t) return 'Channels';
		const lower = t.toLowerCase();
		if (lower === 'social') return 'Social';
		if (lower === 'article') return 'Articles';
		return t.charAt(0).toUpperCase() + t.slice(1);
	}
}
