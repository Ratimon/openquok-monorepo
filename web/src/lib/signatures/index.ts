import type { SignaturesConfig } from '$lib/signatures/Signatures.repository.svelte';
import { httpGateway } from '$lib/core/index';
import { SignaturesRepository } from '$lib/signatures/Signatures.repository.svelte';
import { GetSignaturesPresenter } from '$lib/signatures/GetSignatures.presenter.svelte';

const signaturesConfig: SignaturesConfig = {
	endpoints: {
		list: '/api/v1/signatures',
		create: '/api/v1/signatures',
		byId: (id: string) => `/api/v1/signatures/${encodeURIComponent(id)}`
	}
};

export const signaturesRepository = new SignaturesRepository(httpGateway, signaturesConfig);
export const getSignaturesPresenter = new GetSignaturesPresenter(signaturesRepository);

export type { SignatureProgrammerModel } from '$lib/signatures/Signatures.repository.svelte';
export type { FetchSignaturesForComposerFn } from '$lib/signatures/Signatures.repository.svelte';
export type { SignatureUpsertProgrammerModel } from '$lib/signatures/Signatures.repository.svelte';
export type { SignatureViewModel } from '$lib/signatures/GetSignatures.presenter.svelte';
export { SignaturesStatus } from '$lib/signatures/Signatures.presenter.svelte';
export {
	createSignatureSchema,
	updateSignatureSchema,
	signatureContentSchema,
	signatureOrganizationIdSchema,
	signatureTitleSchema
} from '$lib/signatures/signatures.types';
export type { CreateSignatureInput, UpdateSignatureInput } from '$lib/signatures/signatures.types';

