import type { HttpGateway } from '$lib/core/HttpGateway';

import { ApiError } from '$lib/core/HttpGateway';

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
		organizationId: string,
		fetch?: typeof globalThis.fetch
	): Promise<{ ok: true; items: SetProgrammerModel[] } | { ok: false; error: string }> {
		try {
			const { ok, data: dto } = await this.httpGateway.get<ListSetsResponseDto>(
				this.config.endpoints.list,
				{ organizationId },
				{ withCredentials: true, fetch }
			);
			if (ok && dto?.success === true && Array.isArray(dto.data)) {
				return { ok: true, items: dto.data };
			}
			return { ok: false, error: dto?.message ?? 'Could not load sets.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not load sets.');
		}
	}

	async upsert(
		body: { organizationId: string; id?: string; name: string; content: string },
		fetch?: typeof globalThis.fetch
	): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
		try {
			const { ok, data: dto } = await this.httpGateway.post<UpsertSetResponseDto>(
				this.config.endpoints.upsert,
				body,
				{ withCredentials: true, fetch }
			);
			if (ok && dto?.success === true && dto.data?.id && typeof dto.data.id === 'string') {
				return { ok: true, id: dto.data.id };
			}
			return { ok: false, error: dto?.message ?? 'Could not save set.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not save set.');
		}
	}

	async deleteById(id: string, fetch?: typeof globalThis.fetch): Promise<{ ok: true } | { ok: false; error: string }> {
		try {
			const { ok, data: dto } = await this.httpGateway.delete<{ success?: boolean; message?: string }>(
				this.config.endpoints.byId(id),
				{ withCredentials: true, fetch }
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
