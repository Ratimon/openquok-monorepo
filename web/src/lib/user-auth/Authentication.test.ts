import type { BasicUserAuthProgrammerModel } from '$lib/user-auth/Authentication.repository.svelte';
import type { AuthConfig } from '$lib/user-auth/Authentication.repository.svelte';

import { describe, it, expect, vi, beforeAll } from 'vitest';

import { httpGateway } from '$lib/core/index';
import type { HttpGateway } from '$lib/core/HttpGateway';
import { AuthStatus } from '$lib/user-auth/AuthStatus.model.svelte';
import { AuthenticationRepository } from '$lib/user-auth/Authentication.repository.svelte';
import { AuthStatusModel } from '$lib/user-auth/AuthStatus.model.svelte';
import { SignupPresenter } from '$lib/user-auth/Signup.presenter.svelte';
import { SignupStatus } from '$lib/user-auth/Signup.presenter.svelte';

import { GetSuccessfulSignupStub } from '$tests/utils/GetSuccessfulSignupStub';
import { GetFailedSignupStub } from '$tests/utils/GetFailedSignupStub';

describe('Signup', () => {
	let gateway: HttpGateway | null = null;
	let authenticationRepository: AuthenticationRepository | null = null;
	let authStatusModel: AuthStatusModel;
	let presenter: SignupPresenter;
	let userTestModel: BasicUserAuthProgrammerModel | null | undefined = null;
	let authStatusTestModel: AuthStatusModel | null = null;

	beforeAll(() => {
		gateway = httpGateway;
		authStatusModel = new AuthStatusModel();

		const authConfig: AuthConfig = {
			endpoints: {
				signin: '/api/v1/auth/sign-in',
				signup: '/api/v1/auth/sign-up',
				signout: '/api/v1/auth/sign-out',
				verifySignup: '/api/v1/auth/verify-signup',
				sendVerificationEmail: '/api/v1/auth/send-verification-email',
				checkSignupVerification: '/api/v1/auth/check-signup-verification',
				askPasswordReset: '/api/v1/auth/ask-reset',
				verifyReset: '/api/v1/auth/verify-reset',
				refresh: '/api/v1/auth/refresh',
				me: '/api/v1/users/me'
			},
			storageKeys: {
				token: 'auth_token',
				user: 'auth_user',
				refreshToken: 'auth_refresh_token'
			}
		};

		authenticationRepository = new AuthenticationRepository(gateway, authConfig, authStatusModel);
		presenter = new SignupPresenter(authenticationRepository);
	});

	async function setup(
		signupStub: () => { data: { success: boolean; data: unknown; message: string }; ok: boolean },
		payload: { fullName: string; email: string; password: string }
	) {
		const mockResponse = signupStub();
		gateway!.post = vi.fn().mockResolvedValue(mockResponse);

		presenter.showToastMessage = false;
		presenter.toastMessage = '';

		await presenter.signup(payload.fullName, payload.email, payload.password);

		userTestModel = authenticationRepository?.currentUser ?? null;
		authStatusTestModel = authStatusModel;
	}

	it('should signup a new user and show successful validation message', async () => {
		const signUpData = {
			fullName: 'John Doe',
			email: 'johndoe@test.com',
			password: 'password'
		};

		await setup(GetSuccessfulSignupStub, signUpData);

		expect(gateway!.post).toHaveBeenCalledWith(
			'/api/v1/auth/sign-up',
			{
				fullName: 'John Doe',
				email: 'johndoe@test.com',
				password: 'password'
			},
			{ withCredentials: true, skipInterceptors: true }
		);

		expect(presenter.showToastMessage).toBe(true);
		expect(presenter.toastMessage).toBe(
			'We have sent a confirmation link to your email address. Please check your inbox and click the link to complete your registration.'
		);
		expect(presenter.status).toBe(SignupStatus.SUBMITTED);

		expect(userTestModel?.email).toBe('johndoe@test.com');
		expect(userTestModel?.fullName).toBe('John Doe');

		expect(authStatusTestModel?.status).toBe(AuthStatus.UNAUTHENTICATED);
	});

	it('should show failed validation message on presenter', async () => {
		const previousUser = userTestModel;

		const signUpData = {
			fullName: 'John Doe',
			email: 'johndoe@test.com',
			password: 'password'
		};

		await setup(GetFailedSignupStub, signUpData);

		expect(gateway!.post).toHaveBeenCalledWith(
			'/api/v1/auth/sign-up',
			{
				fullName: 'John Doe',
				email: 'johndoe@test.com',
				password: 'password'
			},
			{ withCredentials: true, skipInterceptors: true }
		);

		expect(presenter.showToastMessage).toBe(true);
		expect(presenter.toastMessage).toBe('Signup failed. Please try again.');
		expect(presenter.status).toBe(SignupStatus.UNKNOWN);

		expect(userTestModel).toEqual(previousUser);
		expect(authStatusTestModel?.status).toBe(AuthStatus.CHECKING);
	});
});
