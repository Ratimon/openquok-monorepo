import type { AuthenticationRepository } from '$lib/user-auth/Authentication.repository.svelte';

export enum SignupStatus {
	UNKNOWN = 'unknown',
	SUBMITTING = 'submitting',
	SUBMITTED = 'submitted',
	RESENDING_EMAIL = 'resending_email',
	VERIFYING_EMAIL = 'verifying_email',
	SUCCESS = 'success'
}

export class SignupPresenter {
	private authenticationRepository: AuthenticationRepository;

	status: SignupStatus = $state(SignupStatus.UNKNOWN);
	showToastMessage: boolean = $state(false);
	toastMessage: string = $state('');

	constructor(authenticationRepository: AuthenticationRepository) {
		this.authenticationRepository = authenticationRepository;
	}

	async signup(fullName: string, email: string, password: string): Promise<void> {
		this.status = SignupStatus.SUBMITTING;
		const result = await this.authenticationRepository.signup({
			fullName,
			email,
			password
		});
		if (result.success) {
			this.showToastMessage = true;
			this.toastMessage = result.message;
			this.status = SignupStatus.SUBMITTED;
		} else {
			this.showToastMessage = true;
			this.toastMessage = result.message;
			this.status = SignupStatus.UNKNOWN;
		}
	}

	async resendConfirmationEmail(email: string): Promise<void> {
		this.status = SignupStatus.RESENDING_EMAIL;
		const result = await this.authenticationRepository.sendVerificationEmail({ email });
		if (result.success) {
			this.showToastMessage = true;
			this.toastMessage = result.message;
			this.status = SignupStatus.VERIFYING_EMAIL;
		} else {
			this.showToastMessage = true;
			this.toastMessage = result.message;
			this.status = SignupStatus.SUBMITTED;
		}
	}
}
