import type {
	SignatureProgrammerModel,
	SignaturesRepository
} from '$lib/signatures/Signature.repository.svelte';

/** UI view model for signatures (currently 1:1 with the repository PM). */
export type SignatureViewModel = SignatureProgrammerModel;

export class GetSignaturesPresenter {
	constructor(private readonly signaturesRepository: SignaturesRepository) {}

	public toSignatureVm(pm: SignatureProgrammerModel): SignatureViewModel {
		return pm;
	}

	public toSignatureListVm(listPm: SignatureProgrammerModel[]): SignatureViewModel[] {
		return listPm.map((pm) => this.toSignatureVm(pm));
	}

	/**
	 * Load workspace signatures and map to {@link SignatureViewModel}.
	 * Stateless: does not touch `$state`.
	 */
	public async loadSignaturesForOrganizationVm(
		organizationId: string,
		fetch?: typeof globalThis.fetch
	): Promise<SignatureViewModel[]> {
		const res = await this.signaturesRepository.listForOrganization(organizationId, fetch);
		if (!res.ok) return [];
		return this.toSignatureListVm(res.items);
	}
}

