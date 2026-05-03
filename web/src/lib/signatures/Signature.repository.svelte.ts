import type { HttpGateway } from '$lib/core/HttpGateway';
import type { CreateSignatureInput, UpdateSignatureInput } from '$lib/signatures/signature.types';

import { ApiError } from '$lib/core/HttpGateway';
import { HttpMethod } from '$lib/core/HttpGateway';


export type SignatureProgrammerModel = {
	id: string;
	title: string;
	content: string;
	isDefault: boolean;
	createdAt: string;
	updatedAt: string;
};

export type ListSignaturesResponseDto = {
	success?: boolean;
	data?: SignatureProgrammerModel[];
	message?: string;
};

export type SignatureResponseDto = {
	success?: boolean;
	data?: SignatureProgrammerModel | null;
	message?: string;
};

export type UpsertSignatureResponseDto = {
	success?: boolean;
	data?: { id?: string };
	message?: string;
};

export interface SignatureUpsertProgrammerModel {
	success: boolean;
	message: string;
	id?: string;
}

export interface SignaturesConfig {
	endpoints: {
		list: string;
		create: string;
		byId: (id: string) => string;
	};
}

export class SignaturesRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: SignaturesConfig
	) {}

	async listForOrganization(
		organizationId: string
	): Promise<{ ok: true; items: SignatureProgrammerModel[] } | { ok: false; error: string }> {
		try {
			const { ok, data: listSignaturesDto } = await this.httpGateway.get<ListSignaturesResponseDto>(
				this.config.endpoints.list,
				{ organizationId },
				{ withCredentials: true }
			);
			if (ok && listSignaturesDto?.success === true && Array.isArray(listSignaturesDto.data)) {
				return { ok: true, items: listSignaturesDto.data };
			}
			return { ok: false, error: listSignaturesDto?.message ?? 'Could not load signatures.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not load signatures.');
		}
	}

	async getById(
		id: string
	): Promise<{ ok: true; item: SignatureProgrammerModel | null } | { ok: false; error: string }> {
		try {
			const { ok, data: signatureDto } = await this.httpGateway.get<SignatureResponseDto>(
				this.config.endpoints.byId(id),
				undefined,
				{ withCredentials: true }
			);
			if (ok && signatureDto?.success === true) {
				return { ok: true, item: signatureDto.data ?? null };
			}
			return { ok: false, error: signatureDto?.message ?? 'Could not load signature.' };
		} catch (error) {
			return this.mapCatch(error, 'Could not load signature.');
		}
	}

	async create(input: CreateSignatureInput): Promise<SignatureUpsertProgrammerModel> {
		try {
			const { ok, data: createSignatureDto } = await this.httpGateway.post<UpsertSignatureResponseDto>(
				this.config.endpoints.create,
				{
					organizationId: input.organizationId,
					title: input.title,
					content: input.content,
					isDefault: input.isDefault ?? false
				},
				{ withCredentials: true }
			);
			const id = createSignatureDto?.data?.id;
			if (ok && createSignatureDto?.success === true && typeof id === 'string' && id.length > 0) {
				return { success: true, message: createSignatureDto?.message ?? 'Signature created.', id };
			}
			return { success: false, message: createSignatureDto?.message ?? 'Could not create signature.' };
		} catch (error) {
			return { success: false, message: this.extractMessage(error, 'Could not create signature.') };
		}
	}

	async update(id: string, input: UpdateSignatureInput): Promise<SignatureUpsertProgrammerModel> {
		try {
			const { ok, data: updateSignatureDto } = await this.httpGateway.request<UpsertSignatureResponseDto>({
				method: HttpMethod.PATCH,
				url: this.config.endpoints.byId(id),
				data: input,
				withCredentials: true
			});
			const outId = updateSignatureDto?.data?.id ?? id;
			if (ok && updateSignatureDto?.success === true && typeof outId === 'string') {
				return { success: true, message: updateSignatureDto?.message ?? 'Signature updated.', id: outId };
			}
			return { success: false, message: updateSignatureDto?.message ?? 'Could not update signature.' };
		} catch (error) {
			return { success: false, message: this.extractMessage(error, 'Could not update signature.') };
		}
	}

	async delete(id: string): Promise<SignatureUpsertProgrammerModel> {
		try {
			const { ok, data: deleteSignatureDto } = await this.httpGateway.delete<{ success?: boolean; message?: string }>(
				this.config.endpoints.byId(id),
				{ withCredentials: true }
			);
			if (ok && deleteSignatureDto?.success === true) {
				return { success: true, message: deleteSignatureDto?.message ?? 'Signature deleted.' };
			}
			return { success: false, message: deleteSignatureDto?.message ?? 'Could not delete signature.' };
		} catch (error) {
			return { success: false, message: this.extractMessage(error, 'Could not delete signature.') };
		}
	}

	private mapCatch(error: unknown, fallback: string): { ok: false; error: string } {
		return { ok: false, error: this.extractMessage(error, fallback) };
	}

	private extractMessage(error: unknown, fallback: string): string {
		if (error instanceof ApiError && typeof error.data === 'object' && error.data !== null) {
			const o = error.data as Record<string, unknown>;
			if (typeof o.message === 'string') return o.message;
		}
		return fallback;
	}
}

/** Composer toolbar signature picker: read-only list fetch (no presenter state). */
export type FetchSignaturesForComposerFn = SignaturesRepository['listForOrganization'];
