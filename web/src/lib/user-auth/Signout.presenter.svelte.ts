import type { AuthenticationRepository } from '$lib/user-auth/Authentication.repository.svelte';

export enum SignoutStatus {
	SIGNEDIN = 'signedin',
	SUBMITTING = 'submitting',
	SUCCESS = 'success'
}

export class SignoutPresenter {
	private authenticationRepository: AuthenticationRepository;

	status: SignoutStatus = $state(SignoutStatus.SIGNEDIN);
	showToastMessage = $state(false);
	toastMessage = $state('Signed out');

	constructor(authenticationRepository: AuthenticationRepository) {
		this.authenticationRepository = authenticationRepository;
	}

	async signout(): Promise<void> {
		this.status = SignoutStatus.SUBMITTING;
		const result = await this.authenticationRepository.signout();
		this.showToastMessage = true;
		this.toastMessage = result.message;
		this.status = SignoutStatus.SUCCESS;
	}
}
