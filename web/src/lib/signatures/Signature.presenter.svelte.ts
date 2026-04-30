import type { CreateSignatureInput, UpdateSignatureInput } from '$lib/signatures/signature.types';
import type { SignaturesRepository } from '$lib/signatures/Signature.repository.svelte';
import type { GetSignaturesPresenter, SignatureViewModel } from '$lib/signatures/GetSignature.presenter.svelte';

export enum SignaturesStatus {
	IDLE = 'idle',
	LOADING = 'loading',
	CREATING = 'creating',
	UPDATING = 'updating',
	DELETING = 'deleting'
}

export class SignaturesPresenter {
	constructor(
		private readonly signaturesRepository: SignaturesRepository,
		private readonly getSignaturesPresenter: GetSignaturesPresenter
	) {}

	public status = $state<SignaturesStatus>(SignaturesStatus.IDLE);
	public itemsVm = $state<SignatureViewModel[]>([]);
	public showToastMessage = $state(false);
	public toastMessage = $state('');
	public toastIsError = $state(false);

	private _nowIso(): string {
		return new Date().toISOString();
	}

	private _applyCreatedSignature(id: string, input: Omit<CreateSignatureInput, 'organizationId'>): void {
		const now = this._nowIso();
		const next: SignatureViewModel = {
			id,
			title: input.title,
			content: input.content,
			isDefault: input.isDefault ?? false,
			createdAt: now,
			updatedAt: now
		};
		if (next.isDefault) {
			this.itemsVm = [next, ...this.itemsVm.map((s) => (s.isDefault ? { ...s, isDefault: false } : s))];
			return;
		}
		this.itemsVm = [next, ...this.itemsVm];
	}

	private _applyUpdatedSignature(id: string, input: UpdateSignatureInput): boolean {
		const existingIndex = this.itemsVm.findIndex((s) => s.id === id);
		if (existingIndex < 0) return false;

		const existing = this.itemsVm[existingIndex];
		const now = this._nowIso();
		const next: SignatureViewModel = {
			...existing,
			title: input.title ?? existing.title,
			content: input.content ?? existing.content,
			isDefault: input.isDefault ?? existing.isDefault,
			updatedAt: now
		};

		if (input.isDefault === true) {
			this.itemsVm = this.itemsVm.map((s) => {
				if (s.id === id) return next;
				return s.isDefault ? { ...s, isDefault: false } : s;
			});
			return true;
		}

		this.itemsVm = [
			...this.itemsVm.slice(0, existingIndex),
			next,
			...this.itemsVm.slice(existingIndex + 1)
		];
		return true;
	}

	private _applyDeletedSignature(id: string): void {
		this.itemsVm = this.itemsVm.filter((s) => s.id !== id);
	}

	public async loadSignaturesForOrganization(organizationId: string): Promise<void> {
		this.status = SignaturesStatus.LOADING;
		try {
			this.itemsVm = await this.getSignaturesPresenter.loadSignaturesForOrganizationVm(organizationId);
		} finally {
			this.status = SignaturesStatus.IDLE;
		}
	}

	async create(organizationId: string, input: Omit<CreateSignatureInput, 'organizationId'>): Promise<boolean> {
		this.status = SignaturesStatus.CREATING;
		try {
			const normalizedInput: Omit<CreateSignatureInput, 'organizationId'> = {
				...input,
				isDefault: input.isDefault ?? false
			};
			const resPm = await this.signaturesRepository.create({
				organizationId,
				...normalizedInput
			});
			if (!resPm.success || !resPm.id) {
				this.toastIsError = true;
				this.toastMessage = resPm.message ?? 'Could not create signature.';
				this.showToastMessage = true;
				return false;
			}
			this._applyCreatedSignature(resPm.id, normalizedInput);
			this.toastIsError = false;
			this.toastMessage = resPm.message ?? 'Signature created.';
			this.showToastMessage = true;
			return true;
		} finally {
			this.status = SignaturesStatus.IDLE;
		}
	}

	async update(id: string, input: UpdateSignatureInput): Promise<boolean> {
		this.status = SignaturesStatus.UPDATING;
		try {
			const resPm = await this.signaturesRepository.update(id, input);
			if (!resPm.success) {
				this.toastIsError = true;
				this.toastMessage = resPm.message ?? 'Could not update signature.';
				this.showToastMessage = true;
				return false;
			}
			// Apply in-memory update; if the item isn't present, we still consider the mutation succeeded.
			this._applyUpdatedSignature(id, input);
			this.toastIsError = false;
			this.toastMessage = resPm.message ?? 'Signature updated.';
			this.showToastMessage = true;
			return true;
		} finally {
			this.status = SignaturesStatus.IDLE;
		}
	}

	async delete(id: string): Promise<boolean> {
		this.status = SignaturesStatus.DELETING;
		try {
			const resPm = await this.signaturesRepository.delete(id);
			if (!resPm.success) {
				this.toastIsError = true;
				this.toastMessage = resPm.message ?? 'Could not delete signature.';
				this.showToastMessage = true;
				return false;
			}
			this._applyDeletedSignature(id);
			this.toastIsError = false;
			this.toastMessage = resPm.message ?? 'Signature deleted.';
			this.showToastMessage = true;
			return true;
		} finally {
			this.status = SignaturesStatus.IDLE;
		}
	}
}
