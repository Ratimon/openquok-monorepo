import type { AuthenticationRepository } from '$lib/user-auth/Authentication.repository.svelte';

export enum ResetPasswordStatus {
	UNKNOWN = 'unknown',
	RESET_REQUEST_SUBMITTING = 'reset_request_submitting',
	RESET_REQUEST_SENT = 'reset_request_sent',
	CODE_VERIFICATION_PENDING = 'code_verify_pending',
	CODE_VERIFICATION_SUBMITTING = 'code_verification_submitting',
	CODE_VERIFICATION_SUCCESS = 'code_verification_success'
}

export class ResetPasswordPresenter {
	private authenticationRepository: AuthenticationRepository;

	status: ResetPasswordStatus = $state(ResetPasswordStatus.UNKNOWN);
	showToastMessage: boolean = $state(false);
	toastMessage: string = $state('');

	constructor(authenticationRepository: AuthenticationRepository) {
		this.authenticationRepository = authenticationRepository;
	}

	async resetPassword(email: string): Promise<void> {
		this.status = ResetPasswordStatus.RESET_REQUEST_SUBMITTING;
		const authPm = await this.authenticationRepository.resetPassword({ email });
		this.showToastMessage = true;
		this.toastMessage = authPm.message;
		this.status = authPm.success ? ResetPasswordStatus.RESET_REQUEST_SENT : ResetPasswordStatus.UNKNOWN;
	}

	async verifyReset(email: string, code: string, type: 'recovery'): Promise<void> {
		this.status = ResetPasswordStatus.CODE_VERIFICATION_SUBMITTING;
		const authPm = await this.authenticationRepository.verifyReset({ email, code, type });
		this.showToastMessage = true;
		this.toastMessage = authPm.message;
		this.status = authPm.success ? ResetPasswordStatus.CODE_VERIFICATION_SUCCESS : ResetPasswordStatus.UNKNOWN;
	}
}
