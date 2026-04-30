import type { CreateSignatureInput, UpdateSignatureInput } from '$lib/signatures/signatures.types';
import type {
	SignatureProgrammerModel,
	SignaturesRepository
} from '$lib/signatures/Signatures.repository.svelte';

export enum SignaturesStatus {
	IDLE = 'idle',
	LOADING = 'loading',
	CREATING = 'creating',
	UPDATING = 'updating',
	DELETING = 'deleting'
}

export class SignaturesPresenter {
	constructor(private readonly signaturesRepository: SignaturesRepository) {}

	public status: SignaturesStatus = $state(SignaturesStatus.IDLE);
	public items: SignatureProgrammerModel[] = $state([]);
	public showToastMessage: boolean = $state(false);
	public toastMessage: string = $state('');
	public toastIsError: boolean = $state(false);

	async load(organizationId: string): Promise<void> {
		this.status = SignaturesStatus.LOADING;
		try {
			const res = await this.signaturesRepository.listForOrganization(organizationId);
			if (res.ok) {
				this.items = res.items;
			} else {
				this._toast(true, res.error);
			}
		} finally {
			this.status = SignaturesStatus.IDLE;
		}
	}

	async create(organizationId: string, input: Omit<CreateSignatureInput, 'organizationId'>): Promise<boolean> {
		this.status = SignaturesStatus.CREATING;
		try {
			const res = await this.signaturesRepository.create({
				organizationId,
				...input,
				isDefault: input.isDefault ?? false
			});
			if (!res.ok) {
				this._toast(true, res.error);
				return false;
			}
			await this.load(organizationId);
			this._toast(false, 'Signature created.');
			return true;
		} finally {
			this.status = SignaturesStatus.IDLE;
		}
	}

	async update(organizationId: string, id: string, input: UpdateSignatureInput): Promise<boolean> {
		this.status = SignaturesStatus.UPDATING;
		try {
			const res = await this.signaturesRepository.update(id, input);
			if (!res.ok) {
				this._toast(true, res.error);
				return false;
			}
			await this.load(organizationId);
			this._toast(false, 'Signature updated.');
			return true;
		} finally {
			this.status = SignaturesStatus.IDLE;
		}
	}

	async delete(organizationId: string, id: string): Promise<boolean> {
		this.status = SignaturesStatus.DELETING;
		try {
			const res = await this.signaturesRepository.delete(id);
			if (!res.ok) {
				this._toast(true, res.error);
				return false;
			}
			await this.load(organizationId);
			this._toast(false, 'Signature deleted.');
			return true;
		} finally {
			this.status = SignaturesStatus.IDLE;
		}
	}

	private _toast(isError: boolean, message: string) {
		this.toastIsError = isError;
		this.toastMessage = message;
		this.showToastMessage = true;
	}
}
