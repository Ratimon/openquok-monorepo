import type { HttpGateway } from '$lib/core/HttpGateway';
import type { PostMediaProgrammerModel, RepeatIntervalKey } from '$lib/posts';

import { ApiError } from '$lib/core/HttpGateway';

/** One scheduled follow-up (Threads / Instagram); set-level list is shared across selected channels. */
export type SetSharedFollowUpReplyProgrammerModel = {
	id: string;
	message: string;
	delaySeconds: number;
};

/** Persisted JSON shape for `/sets` `content` column (workspace presets). */
export type SetSnapshotProgrammerModel = {
	selectedIntegrationIds: string[];
	selectedGroupId: string | null;
	mode: 'global' | 'custom';
	focusedIntegrationId: string | null;
	globalBody: string;
	bodiesByIntegrationId: Record<string, string>;
	providerSettingsByIntegrationId: Record<string, Record<string, unknown>>;
	/**
	 * Set authoring / templates: one list of follow-ups for all selected Threads+Instagram channels
	 * Also copied into each integration’s `providerSettings` on save.
	 */
	sharedFollowUpReplies?: SetSharedFollowUpReplyProgrammerModel[];
	postMediaItems: PostMediaProgrammerModel[];
	selectedTagNames: string[];
	repeatInterval: RepeatIntervalKey | null;
};

export function stringifySetSnapshot(snapshot: SetSnapshotProgrammerModel): string {
	return JSON.stringify(snapshot);
}

export function parseSetContent(raw: string): SetSnapshotProgrammerModel | null {
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!parsed || typeof parsed !== 'object') return null;
		const o = parsed as Record<string, unknown>;
		if (!Array.isArray(o.selectedIntegrationIds)) return null;
		const ids = o.selectedIntegrationIds.filter((x): x is string => typeof x === 'string');
		const mode = o.mode === 'custom' || o.mode === 'global' ? o.mode : null;
		if (!mode) return null;

		const bodiesRaw = o.bodiesByIntegrationId;
		const bodiesByIntegrationId =
			bodiesRaw && typeof bodiesRaw === 'object' && !Array.isArray(bodiesRaw)
				? (bodiesRaw as Record<string, string>)
				: {};
		const settingsRaw = o.providerSettingsByIntegrationId;
		const providerSettingsByIntegrationId =
			settingsRaw && typeof settingsRaw === 'object' && !Array.isArray(settingsRaw)
				? (settingsRaw as Record<string, Record<string, unknown>>)
				: {};

		let sharedFollowUpReplies: SetSharedFollowUpReplyProgrammerModel[] | undefined;
		const sfr = o.sharedFollowUpReplies;
		if (Array.isArray(sfr)) {
			sharedFollowUpReplies = sfr
				.map((r: unknown) => {
					const x = r as Record<string, unknown>;
					return {
						id: typeof x.id === 'string' ? x.id : '',
						message: typeof x.message === 'string' ? x.message : '',
						delaySeconds: Number.isFinite(Number(x.delaySeconds)) ? Math.max(0, Math.floor(Number(x.delaySeconds))) : 0
					};
				})
				.filter((r) => r.id && (r.message ?? '').trim().length > 0);
		}

		let repeatInterval: RepeatIntervalKey | null = null;
		if (o.repeatInterval === null) repeatInterval = null;
		else if (typeof o.repeatInterval === 'string') repeatInterval = o.repeatInterval as RepeatIntervalKey;

		return {
			selectedIntegrationIds: ids,
			selectedGroupId: typeof o.selectedGroupId === 'string' ? o.selectedGroupId : null,
			mode,
			focusedIntegrationId: typeof o.focusedIntegrationId === 'string' ? o.focusedIntegrationId : null,
			globalBody: typeof o.globalBody === 'string' ? o.globalBody : '',
			bodiesByIntegrationId,
			providerSettingsByIntegrationId,
			...(sharedFollowUpReplies && sharedFollowUpReplies.length > 0 ? { sharedFollowUpReplies } : {}),
			postMediaItems: Array.isArray(o.postMediaItems) ? (o.postMediaItems as PostMediaProgrammerModel[]) : [],
			selectedTagNames: Array.isArray(o.selectedTagNames)
				? o.selectedTagNames.filter((x): x is string => typeof x === 'string')
				: [],
			repeatInterval
		};
	} catch {
		return null;
	}
}

export type SetProgrammerModel = {
	id: string;
	organizationId: string;
	name: string;
	content: string;
	createdAt: string;
	updatedAt: string;
};

export type ListSetsResponseDto = {
	success?: boolean;
	data?: SetProgrammerModel[];
	message?: string;
};

export type UpsertSetResponseDto = {
	success?: boolean;
	data?: { id?: string };
	message?: string;
};

export interface SetsConfig {
	endpoints: {
		list: string;
		upsert: string;
		byId: (id: string) => string;
	};
}

export class SetsRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: SetsConfig
	) {}

	async listForOrganization(
		organizationId: string
	): Promise<{ ok: true; items: SetProgrammerModel[] } | { ok: false; error: string }> {
		try {
			const { ok, data: dto } = await this.httpGateway.get<ListSetsResponseDto>(
				this.config.endpoints.list,
				{ organizationId },
				{ withCredentials: true }
			);
			if (ok && dto?.success === true && Array.isArray(dto.data)) {
				return { ok: true, items: dto.data };
			}
			return { ok: false, error: dto?.message ?? 'Could not load sets.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not load sets.');
		}
	}

	async upsert(body: {
		organizationId: string;
		id?: string;
		name: string;
		content: string;
	}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
		try {
			const { ok, data: dto } = await this.httpGateway.post<UpsertSetResponseDto>(
				this.config.endpoints.upsert,
				body,
				{ withCredentials: true }
			);
			if (ok && dto?.success === true && dto.data?.id && typeof dto.data.id === 'string') {
				return { ok: true, id: dto.data.id };
			}
			return { ok: false, error: dto?.message ?? 'Could not save set.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not save set.');
		}
	}

	async deleteById(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
		try {
			const { ok, data: dto } = await this.httpGateway.delete<{ success?: boolean; message?: string }>(
				this.config.endpoints.byId(id),
				{ withCredentials: true }
			);
			if (ok && dto?.success === true) {
				return { ok: true };
			}
			return { ok: false, error: dto?.message ?? 'Could not delete set.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not delete set.');
		}
	}

	private mapCatch(error: unknown, fallback: string): { ok: false; error: string } {
		if (error instanceof ApiError && typeof error.data === 'object' && error.data !== null && 'message' in error.data) {
			const m = (error.data as Record<string, unknown>).message;
			if (typeof m === 'string' && m.trim()) return { ok: false, error: m };
		}
		return { ok: false, error: fallback };
	}
}
