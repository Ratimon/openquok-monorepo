import type { AuthenticationRepository } from '$lib/user-auth/Authentication.repository.svelte';

export enum VerifyEmailStatus {
	VERIFY_PENDING = 'verify_pending',
	CONFIRMING = 'confirming',
	CONFIRMED = 'confirmed'
}

export class VerifyEmailPresenter {
	private authenticationRepository: AuthenticationRepository;

	status: VerifyEmailStatus = $state(VerifyEmailStatus.VERIFY_PENDING);
	showToastMessage: boolean = $state(false);
	toastMessage: string = $state('');

	constructor(authenticationRepository: AuthenticationRepository) {
		this.authenticationRepository = authenticationRepository;
	}

	async verifyEmail(token: string, subscribeToNewsletter?: boolean): Promise<void> {
		this.status = VerifyEmailStatus.CONFIRMING;
		const result = await this.authenticationRepository.verifySignup({ token, subscribeToNewsletter });
		if (result.success) {
			this.showToastMessage = true;
			this.toastMessage = result.message;
			this.status = VerifyEmailStatus.CONFIRMED;
		} else {
			this.showToastMessage = true;
			this.toastMessage = result.message;
			this.status = VerifyEmailStatus.VERIFY_PENDING;
		}
	}

	async checkIfUserIsAllowedToConfirmEmail(token?: string, email?: string): Promise<boolean> {
		try {
			return await this.authenticationRepository.checkSignupVerification(token, email);
		} catch {
			return false;
		}
	}
}
