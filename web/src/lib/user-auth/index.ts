import type { AuthConfig } from '$lib/user-auth/Authentication.repository.svelte';
import { httpGateway } from '$lib/core/index';
import { AuthenticationRepository } from '$lib/user-auth/Authentication.repository.svelte';
import { AuthStatusModel } from '$lib/user-auth/AuthStatus.model.svelte';
import { SigninPresenter } from '$lib/user-auth/Signin.presenter.svelte';
import { SignupPresenter } from '$lib/user-auth/Signup.presenter.svelte';
import { SignoutPresenter } from '$lib/user-auth/Signout.presenter.svelte';
import { VerifyEmailPresenter } from '$lib/user-auth/VerifyEmail.presenter.svelte';
import { ResetPasswordPresenter } from '$lib/user-auth/ResetPassword.presenter.svelte';

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

const authStatusModel = new AuthStatusModel();
const authenticationRepository = new AuthenticationRepository(
	httpGateway,
	authConfig,
	authStatusModel
);

const signinPresenter = new SigninPresenter(authenticationRepository);
const signupPresenter = new SignupPresenter(authenticationRepository);
const signoutPresenter = new SignoutPresenter(authenticationRepository);
const verifyEmailPresenter = new VerifyEmailPresenter(authenticationRepository);
const resetPasswordPresenter = new ResetPasswordPresenter(authenticationRepository);

export {
	resetPasswordCodeSchema,
	resetPasswordEmailSchema,
	signinFormSchema,
	signupFormSchema,
	type SigninFormSchemaType,
	type SignupFormSchemaType
} from '$lib/user-auth/user-auth.types';

export { OAUTH_GOOGLE_PATH, getGoogleOAuthStartUrl } from '$lib/user-auth/constants/googleOAuth';

export { authStatusModel, authenticationRepository, signinPresenter, signupPresenter, signoutPresenter, verifyEmailPresenter, resetPasswordPresenter };
export { AuthStatus } from '$lib/user-auth/AuthStatus.model.svelte';
export { ResetPasswordStatus } from '$lib/user-auth/ResetPassword.presenter.svelte';
export type { BasicUserAuthProgrammerModel } from '$lib/user-auth/Authentication.repository.svelte';
