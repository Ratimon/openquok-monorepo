import type { AuthenticationRepository } from '$lib/user-auth/Authentication.repository.svelte';

export enum SigninStatus {
	UNKNOWN = 'unknown',
	SUBMITTING = 'submitting',
	SUCCESS = 'success'
}

export class SigninPresenter {
	private authenticationRepository: AuthenticationRepository;

	status: SigninStatus = $state(SigninStatus.UNKNOWN);
	showToastMessage: boolean = $state(false);
	toastMessage: string = $state('');

	constructor(authenticationRepository: AuthenticationRepository) {
		this.authenticationRepository = authenticationRepository;
	}

	async signin(email: string, password: string): Promise<void> {
		this.status = SigninStatus.SUBMITTING;
		const result = await this.authenticationRepository.signin({ email, password });
		if (result.success) {
			this.showToastMessage = true;
			this.toastMessage = result.message;
			this.status = SigninStatus.SUCCESS;
		} else {
			this.showToastMessage = true;
			this.toastMessage = result.message;
			this.status = SigninStatus.UNKNOWN;
		}
	}
}
