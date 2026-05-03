import type {
	SignatureProgrammerModel,
	SignaturesRepository
} from '$lib/signatures/Signature.repository.svelte';

/** UI view model for signatures (currently 1:1 with the repository PM). */
export type SignatureViewModel = SignatureProgrammerModel;

export type LoadSignaturesForOrganizationResult =
	| { ok: true; items: SignatureViewModel[] }
	| { ok: false; error: string };

export class GetSignaturesPresenter {
	constructor(private readonly signaturesRepository: SignaturesRepository) {}

	public toSignatureVm(pm: SignatureProgrammerModel): SignatureViewModel {
		return pm;
	}

	public toSignatureListVm(listPm: SignatureProgrammerModel[]): SignatureViewModel[] {
		return listPm.map((pm) => this.toSignatureVm(pm));
	}

	public async loadSignaturesForOrganizationResult(
		organizationId: string
	): Promise<LoadSignaturesForOrganizationResult> {
		const res = await this.signaturesRepository.listForOrganization(organizationId);
		if (!res.ok) return res;
		return { ok: true, items: this.toSignatureListVm(res.items) };
	}

	/**
	 * Load workspace signatures and map to {@link SignatureViewModel}.
	 * Stateless: does not touch `$state`.
	 */
	public async loadSignaturesForOrganizationVm(organizationId: string): Promise<SignatureViewModel[]> {
		const resVm = await this.loadSignaturesForOrganizationResult(organizationId);
		return resVm.ok ? resVm.items : [];
	}
}

