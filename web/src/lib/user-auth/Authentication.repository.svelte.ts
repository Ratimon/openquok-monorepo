import type { HttpGateway } from '$lib/core/HttpGateway';
import type { AuthStatusModel } from '$lib/user-auth/AuthStatus.model.svelte';
import { ApiError } from '$lib/core/HttpGateway';
import { AuthStatus } from '$lib/user-auth/AuthStatus.model.svelte';
import { dev } from '$app/environment';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
// Prevent redundant refresh attempts immediately after a successful signout.
// `invalidateAll()` triggers multiple layout loads, and the scheduled refresh timer may also fire.
const SIGNOUT_REFRESH_SUPPRESSION_KEY = 'auth_signout_refresh_suppressed_until';
const SIGNOUT_REFRESH_SUPPRESSION_MS = 45 * 1000; // enough for navigation/layout reload
// Prevent redundant refresh attempts after refresh fails with 401.
// This happens when auth check runs on navigation (e.g. `/` -> `/sign-in`).
const REFRESH_FAILURE_SUPPRESSION_KEY = 'auth_refresh_failure_suppressed_until';
const REFRESH_FAILURE_SUPPRESSION_MS = 10 * 1000; // short: avoid UX delays for recovery flows
const TOKEN_EXPIRATION_MS = 60 * 60 * 1000; // 1 hour

export interface SigninCredentials {
	email: string;
	password: string;
}

export interface SignupCredentials {
	email: string;
	password: string;
	fullName?: string;
}

export interface SigninResponseDto {
	success: boolean;
	data: {
		user: BasicUserAuthProgrammerModel;
		accessToken: string;
		refreshToken?: string;
	};
	message: string;
}

export interface SignupResponseDto {
	success: boolean;
	data: {
		user: BasicUserAuthProgrammerModel;
		session: { accessToken: string; refreshToken?: string };
	};
	message: string;
}

export interface SendVerificationEmailResponseDto {
	success: boolean;
	message: string;
}

export interface VerifySignupResponseDto {
	success: boolean;
	message: string;
}

export interface CheckSignupVerificationResponseDto {
	success: boolean;
	message?: string;
	/** Present when checking by email only or when token+email and already verified */
	verified?: boolean;
}

export interface RefreshTokenResponseDto {
	success: boolean;
	data?: {
		accessToken?: string;
		refreshToken?: string;
		expiresIn?: number;
	};
	message: string;
}

export interface AskPasswordResetResponseDto {
	success: boolean;
	message: string;
}

export interface VerifyResetResponseDto {
	success: boolean;
	data?: {
		user: BasicUserAuthProgrammerModel;
		accessToken: string;
		refreshToken: string;
	};
	message: string;
}

export interface BasicUserAuthProgrammerModel {
	id: string | null;
	email: string;
	fullName: string;
	username?: string;
	isEmailVerified?: boolean;
	roles?: string[];
	isSuperAdmin?: boolean;
}

export interface AuthProgrammerModel {
	success: boolean;
	message: string;
}

/** Options for {@link AuthenticationRepository.checkAuth}. */
export type CheckAuthOptions = {
	/**
	 * Re-fetch GET /me even when we already have a token and user marked authenticated.
	 * Use when server-side profile may have changed (e.g. email just verified) without a new session.
	 */
	forceProfile?: boolean;
};

export interface AuthConfig {
	endpoints: {
		signin: string;
		signup: string;
		signout: string;
		verifySignup: string;
		sendVerificationEmail: string;
		checkSignupVerification: string;
		askPasswordReset: string;
		verifyReset: string;
		refresh: string;
		me: string;
	};
	storageKeys: {
		token: string;
		user: string;
		refreshToken: string;
	};
}

function defaultAuthConfig(): AuthConfig {
	return {
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
			token: TOKEN_KEY,
			user: USER_KEY,
			refreshToken: REFRESH_TOKEN_KEY
		}
	};
}

export class AuthenticationRepository {
	private httpGateway: HttpGateway;
	private config: AuthConfig;
	private refreshTimer: ReturnType<typeof setTimeout> | null = null;
	/** Coalesces concurrent refresh calls (rotating refresh tokens invalidate the previous token). */
	private refreshRequestPromise: Promise<string> | null = null;
	private inMemoryToken: { value: string; expiration: number } | null = null;

	public currentUser: BasicUserAuthProgrammerModel | null = $state(null);
	public currentAuthStatus: AuthStatusModel;

	constructor(httpGateway: HttpGateway, config: AuthConfig, authStatusModel: AuthStatusModel) {
		this.httpGateway = httpGateway;
		this.config = { ...defaultAuthConfig(), ...config };
		this.currentAuthStatus = authStatusModel;
		this.setupAuthInterceptor();
	}

	public async checkAuth(loadFetch?: typeof globalThis.fetch, options?: CheckAuthOptions): Promise<void> {
		if (typeof window === 'undefined') {
			this.currentAuthStatus.status = AuthStatus.UNAUTHENTICATED;
			return;
		}

		const setUnauthenticated = () => {
			this.clearTokens();
			this.clearUser();
			this.currentUser = null;
			this.currentAuthStatus.status = AuthStatus.UNAUTHENTICATED;
		};

		const token = this.getToken();
		// If the user just signed out, skip refresh attempts during the immediate redirect/navigation.
		// This avoids redundant POST `/api/v1/auth/refresh` calls that can legitimately 401 after logout.
		if (!token && this.isSignoutRefreshSuppressed()) {
			setUnauthenticated();
			return;
		}
		// If refresh just failed with 401 shortly ago, skip another refresh attempt.
		// This avoids navigation-induced retry spam on unauthenticated pages.
		if (!token && this.isRefreshFailureSuppressed()) {
			setUnauthenticated();
			return;
		}

		// Already authenticated with token and user (e.g. just signed in) — skip refresh to avoid 401/400
		if (token && this.currentUser && this.currentAuthStatus.status === AuthStatus.AUTHENTICATED) {
			this.setupTokenRefresh();
			if (options?.forceProfile === true && this.config.endpoints.me) {
				try {
					await this.fetchCurrentUser(loadFetch);
				} catch {
					// Keep cached user; caller may retry (e.g. after email verification propagates).
				}
			}
			return;
		}

		if (this.config.endpoints.refresh) {
			// Prefer validating with GET /me when we have a token; only call refresh when token is invalid or missing
			if (token && this.config.endpoints.me) {
				try {
					await this.fetchCurrentUser(loadFetch);
					this.setupTokenRefresh();
					return;
				} catch {
					// Token invalid or expired — try refresh
				}
			}
			try {
				await this.refreshToken(loadFetch);
			} catch (error) {
				// Only suppress when the backend explicitly rejects refresh.
				// For network/server errors we want the next navigation to retry.
				if (error instanceof ApiError && error.status === 401) {
					this.suppressRefreshFailures();
				}
				setUnauthenticated();
				return;
			}
			// After a successful refresh (OAuth redirect, returning users, etc), ensure we populate currentUser.
			// Otherwise isAuthenticated() may remain false and protected routes will redirect.
			try {
				if (this.config.endpoints.me) {
					await this.fetchCurrentUser(loadFetch);
				}
			} catch {
				// Fallback to stored user when /me fails; still mark as authenticated so app can retry.
				const stored = this.getStoredUser();
				this.currentUser = stored ?? this.currentUser;
				this.currentAuthStatus.status = AuthStatus.AUTHENTICATED;
			}
			// If fetchCurrentUser succeeded it already set AUTHENTICATED; keep it consistent.
			this.currentAuthStatus.status = AuthStatus.AUTHENTICATED;
			this.setupTokenRefresh();
			return;
		}

		// No refresh endpoint: trust token + stored user only
		if (!token) {
			setUnauthenticated();
			return;
		}
		const stored = this.getStoredUser();
		this.currentUser = stored;
		this.currentAuthStatus.status = AuthStatus.AUTHENTICATED;
		this.setupTokenRefresh();
	}

	/**
	 * Called before redirecting the browser to an OAuth provider.
	 * OAuth callback relies on `POST /auth/refresh` to mint an access token, so we must not suppress refresh.
	 */
	public prepareForOAuthRedirect(): void {
		if (typeof window === 'undefined') return;
		this.clearSignoutRefreshSuppression();
		this.clearRefreshFailureSuppression();
		// Avoid any pending timer trying to refresh mid-navigation.
		if (this.refreshTimer !== null) {
			clearTimeout(this.refreshTimer);
			this.refreshTimer = null;
		}
	}

	public async signin(credentials: SigninCredentials): Promise<AuthProgrammerModel> {
		// New auth flow: clear any post-signout suppression window.
		this.clearSignoutRefreshSuppression();
		this.clearRefreshFailureSuppression();
		this.currentAuthStatus.status = AuthStatus.CHECKING;
		try {
			const response = await this.httpGateway.post<SigninResponseDto>(
				this.config.endpoints.signin,
				credentials,
				{ withCredentials: true, skipInterceptors: true }
			);
			const { data: signinDto, ok } = response;
			if (ok && signinDto.data) {
				const { user, accessToken, refreshToken } = signinDto.data;
				const userModel: BasicUserAuthProgrammerModel = {
					id: user.id ?? null,
					email: user.email,
					fullName: user.fullName ?? user.email,
					username: user.username ?? user.email,
					isEmailVerified: user.isEmailVerified,
					roles: user.roles ?? [],
					isSuperAdmin: user.isSuperAdmin
				};
				this.storeToken(accessToken);
				this.storeUser(userModel);
				this.currentUser = userModel;
				this.currentAuthStatus.status = AuthStatus.AUTHENTICATED;
				this.setupTokenRefresh();
				// Fetch full profile (e.g. isSuperAdmin, roles) so header buttons show without refresh
				try {
					await this.fetchCurrentUser();
				} catch {
					// Keep user from sign-in response if /me fails
				}
				return { success: true, message: signinDto.message };
			}
			return { success: false, message: signinDto?.message ?? 'Sign in failed' };
		} catch (error) {
			this.currentAuthStatus.status = AuthStatus.ERROR;
			if (error instanceof ApiError && typeof error.data === 'object' && error.data !== null && 'message' in error.data) {
				return { success: false, message: String((error.data as { message: string }).message) };
			}
			return { success: false, message: 'Sign in failed. Please try again.' };
		}
	}

	public async signup(credentials: SignupCredentials): Promise<AuthProgrammerModel> {
		// New auth flow: clear any post-signout suppression window.
		this.clearSignoutRefreshSuppression();
		this.clearRefreshFailureSuppression();
		this.currentAuthStatus.status = AuthStatus.CHECKING;
		try {
			const response = await this.httpGateway.post<SignupResponseDto>(
				this.config.endpoints.signup,
				{ email: credentials.email, password: credentials.password, fullName: credentials.fullName },
				{ withCredentials: true, skipInterceptors: true }
			);
			const { data: signupDto, ok } = response;
			if (ok && signupDto.data) {
				const { user, session } = signupDto.data;
				if (session?.accessToken) {
					const userModel: BasicUserAuthProgrammerModel = {
						id: user.id ?? null,
						email: user.email,
						fullName: user.fullName ?? user.email,
						username: user.username ?? user.email,
						isEmailVerified: user.isEmailVerified,
						roles: user.roles
					};
					this.storeToken(session.accessToken);
					this.storeUser(userModel);
					this.currentUser = userModel;
				}
				this.currentAuthStatus.status = AuthStatus.UNAUTHENTICATED;
				return { success: true, message: signupDto.message };
			}
			return { success: false, message: signupDto?.message ?? 'Sign up failed' };
		} catch (error) {
			this.currentAuthStatus.status = AuthStatus.ERROR;
			if (error instanceof ApiError && typeof error.data === 'object' && error.data !== null && 'message' in error.data) {
				return { success: false, message: String((error.data as { message: string }).message) };
			}
			return { success: false, message: 'Sign up failed. Please try again.' };
		}
	}

	public async signout(sendRequest = true): Promise<AuthProgrammerModel> {
		if (typeof window !== 'undefined') {
			// Block refresh attempts triggered by layout reloads and timer callbacks.
			localStorage.setItem(
				SIGNOUT_REFRESH_SUPPRESSION_KEY,
				String(Date.now() + SIGNOUT_REFRESH_SUPPRESSION_MS)
			);
			if (this.refreshTimer !== null) {
				clearTimeout(this.refreshTimer);
				this.refreshTimer = null;
			}
		}
		try {
			if (sendRequest) {
				await this.httpGateway.post(this.config.endpoints.signout, {}, {
					withCredentials: true,
					skipInterceptors: true
				});
			}
		} catch {
			// continue to clear local state
		}
		this.clearTokens();
		this.clearUser();
		this.currentUser = null;
		this.currentAuthStatus.status = AuthStatus.UNAUTHENTICATED;
		return { success: true, message: 'Signed out' };
	}

	public async sendVerificationEmail(credentials: { email: string }): Promise<AuthProgrammerModel> {
		try {
			const response = await this.httpGateway.post<SendVerificationEmailResponseDto>(
				this.config.endpoints.sendVerificationEmail,
				credentials,
				{ skipInterceptors: true }
			);
			const { data: sendVerificationEmailDto, ok } = response;
			if (ok) return { success: true, message: sendVerificationEmailDto.message };
			return { success: false, message: sendVerificationEmailDto?.message ?? 'Failed to send email' };
		} catch (error) {
			if (error instanceof ApiError && typeof error.data === 'object' && error.data !== null && 'message' in error.data) {
				return { success: false, message: String((error.data as { message: string }).message) };
			}
			return { success: false, message: 'Failed to send verification email.' };
		}
	}

	public async verifySignup(credentials: { token: string; subscribeToNewsletter?: boolean }): Promise<AuthProgrammerModel> {
		try {
			const params: Record<string, string> = { token: credentials.token };
			if (credentials.subscribeToNewsletter) params.subscribeToNewsletter = 'true';
			const response = await this.httpGateway.get<VerifySignupResponseDto>(
				this.config.endpoints.verifySignup,
				params,
				{ skipInterceptors: true }
			);
			const { data: verifySignupDto, ok } = response;
			if (ok) return { success: true, message: verifySignupDto.message };
			return { success: false, message: verifySignupDto?.message ?? 'Verification failed' };
		} catch (error) {
			if (error instanceof ApiError && typeof error.data === 'object' && error.data !== null && 'message' in error.data) {
				return { success: false, message: String((error.data as { message: string }).message) };
			}
			return { success: false, message: 'Verification failed. Please try again.' };
		}
	}

	public async checkSignupVerification(token?: string, email?: string): Promise<boolean> {
		try {
			const params: Record<string, string> = {};
			if (token) params.token = token;
			if (email) params.email = email;
			const response = await this.httpGateway.get<CheckSignupVerificationResponseDto>(
				this.config.endpoints.checkSignupVerification,
				params,
				{ skipInterceptors: true }
			);
			return response.ok && response.data?.success === true;
		} catch {
			return false;
		}
	}

	public async resetPassword(credentials: { email: string }): Promise<AuthProgrammerModel> {
		try {
			const response = await this.httpGateway.post<AskPasswordResetResponseDto>(
				this.config.endpoints.askPasswordReset,
				credentials,
				{ skipInterceptors: true }
			);
			const { data: askPasswordResetDto, ok } = response;
			if (ok && askPasswordResetDto) {
				return { success: true, message: askPasswordResetDto.message };
			}
			return { success: false, message: askPasswordResetDto?.message ?? 'Failed to send reset email' };
		} catch (error) {
			if (error instanceof ApiError && typeof error.data === 'object' && error.data !== null && 'message' in error.data) {
				return { success: false, message: String((error.data as { message: string }).message) };
			}
			return { success: false, message: 'Failed to send reset email. Please try again.' };
		}
	}

	public async verifyReset(credentials: { email: string; code: string; type: string }): Promise<AuthProgrammerModel> {
		this.currentAuthStatus.status = AuthStatus.CHECKING;
		this.clearRefreshFailureSuppression();
		try {
			const response = await this.httpGateway.get<VerifyResetResponseDto>(
				this.config.endpoints.verifyReset,
				{ email: credentials.email, code: credentials.code, type: credentials.type },
				{ skipInterceptors: true }
			);
			const { data: verifyResetDto, ok } = response;
			if (ok && verifyResetDto?.data) {
				const { user, accessToken, refreshToken } = verifyResetDto.data;
				const userModel: BasicUserAuthProgrammerModel = {
					id: user.id ?? null,
					email: user.email,
					fullName: user.fullName ?? user.email,
					username: user.username ?? user.email,
					isEmailVerified: user.isEmailVerified,
					roles: user.roles
				};
				this.storeToken(accessToken);
				this.storeUser(userModel);
				this.currentUser = userModel;
				this.currentAuthStatus.status = AuthStatus.AUTHENTICATED;
				this.setupTokenRefresh();
				return { success: true, message: verifyResetDto.message };
			}
			return { success: false, message: verifyResetDto?.message ?? 'Verification failed' };
		} catch (error) {
			this.currentAuthStatus.status = AuthStatus.ERROR;
			if (error instanceof ApiError && typeof error.data === 'object' && error.data !== null && 'message' in error.data) {
				return { success: false, message: String((error.data as { message: string }).message) };
			}
			return { success: false, message: 'Verification failed. Please try again.' };
		}
	}

	public async refreshToken(loadFetch?: typeof globalThis.fetch): Promise<string> {
		if (this.isSignoutRefreshSuppressed()) {
			// Caller intentionally catches refresh failures; skip HTTP to avoid 401 spam.
			throw new Error('Refresh suppressed after signout');
		}
		// If refresh already failed with 401 very recently and we cleared local tokens,
		// skip HTTP entirely to avoid navigation/timer retry spam.
		if (!this.getToken() && this.isRefreshFailureSuppressed()) {
			throw new Error('Refresh suppressed after previous 401');
		}
		if (!this.config.endpoints.refresh) throw new Error('Refresh not configured');

		if (this.refreshRequestPromise) {
			return this.refreshRequestPromise;
		}

		this.refreshRequestPromise = (async () => {
			try {
				// If we're attempting a refresh again, clear any previous "refresh failed" suppression window.
				this.clearRefreshFailureSuppression();
				const response = await this.httpGateway.post<RefreshTokenResponseDto>(
					this.config.endpoints.refresh,
					{},
					{ withCredentials: true, skipInterceptors: true, ...(loadFetch && { fetch: loadFetch }) }
				);
				const { data: refreshTokenDto, ok } = response;
				if (!ok || !refreshTokenDto?.data?.accessToken) throw new Error(refreshTokenDto?.message ?? 'Refresh failed');
				const { accessToken, expiresIn } = refreshTokenDto.data;
				const expiresAt = Date.now() + (expiresIn ?? 3600) * 1000;
				this.storeToken(accessToken, expiresAt);
				this.setupTokenRefresh();
				return accessToken;
			} finally {
				this.refreshRequestPromise = null;
			}
		})();

		return this.refreshRequestPromise;
	}

	/** GET /me to validate token; throws on 401 or other error so caller can try refresh. */
	private async fetchCurrentUser(loadFetch?: typeof globalThis.fetch): Promise<void> {
		const meUrl = this.config.endpoints.me;
		if (!meUrl) throw new Error('Me endpoint not configured');
		const response = await this.httpGateway.get<{
			success: boolean;
			data: {
				id: string;
				email: string | null;
				fullName: string | null;
				username?: string | null;
				isEmailVerified?: boolean;
				roles?: string[];
				isSuperAdmin?: boolean;
			};
		}>(
			meUrl,
			undefined,
			{ withCredentials: true, ...(loadFetch && { fetch: loadFetch }) }
		);
		if (!response.ok || !response.data?.success || !response.data?.data) {
			throw new Error(response.data && typeof response.data === 'object' && 'message' in response.data ? String((response.data as { message: string }).message) : 'Failed to fetch user');
		}
		const d = response.data.data;
		const userModel: BasicUserAuthProgrammerModel = {
			id: d.id ?? null,
			email: d.email ?? '',
			fullName: d.fullName ?? d.email ?? '',
			username: d.username ?? d.email ?? undefined,
			isEmailVerified: d.isEmailVerified,
			roles: d.roles ?? [],
			isSuperAdmin: d.isSuperAdmin ?? false
		};
		this.storeUser(userModel);
		this.currentUser = userModel;
		// If `/me` succeeds, auth is restored: clear any prior refresh failure suppression.
		this.clearRefreshFailureSuppression();
		this.currentAuthStatus.status = AuthStatus.AUTHENTICATED;
	}

	public isAuthenticated(): boolean {
		return this.currentAuthStatus.status === AuthStatus.AUTHENTICATED && this.currentUser !== null;
	}

	/** Update the in-memory and stored user profile (e.g. after PATCH /users/me). Call before invalidateAll() so layout shows updated name. */
	public updateStoredProfile(updates: { fullName?: string }): void {
		if (!this.currentUser) return;
		const next = { ...this.currentUser, ...updates };
		this.currentUser = next;
		this.storeUser(next);
	}

	public getToken(): string | null {
		if (typeof window === 'undefined') return null;
		if (this.inMemoryToken?.value) return this.inMemoryToken.value;
		try {
			// Production: access token is memory-only (not persisted in localStorage).
			if (!dev) return null;
			const raw = localStorage.getItem(this.config.storageKeys.token);
			if (!raw) return null;
			const parsed = JSON.parse(raw) as { value?: unknown };
			const value = parsed?.value;
			if (value == null) return null;
			const token = typeof value === 'string' ? value : String(value);
			// If token was ever stored double-wrapped (e.g. JSON string), use inner value to avoid 431
			if (token.startsWith('{')) {
				try {
					const inner = JSON.parse(token) as { value?: string };
					if (typeof inner?.value === 'string') return inner.value;
				} catch {
					// not JSON, use as-is
				}
			}
			return token;
		} catch {
			return null;
		}
	}

	private storeToken(token: string, expiresAt?: number): void {
		if (typeof window === 'undefined') return;
		const expiration = expiresAt ?? Date.now() + TOKEN_EXPIRATION_MS;
		this.inMemoryToken = { value: token, expiration };
		if (dev) {
			localStorage.setItem(
				this.config.storageKeys.token,
				JSON.stringify({ value: token, expiration })
			);
		}
	}

	private storeUser(user: BasicUserAuthProgrammerModel): void {
		if (typeof window === 'undefined') return;
		localStorage.setItem(this.config.storageKeys.user, JSON.stringify(user));
	}

	private getStoredUser(): BasicUserAuthProgrammerModel | null {
		if (typeof window === 'undefined') return null;
		try {
			const raw = localStorage.getItem(this.config.storageKeys.user);
			if (!raw) return null;
			return JSON.parse(raw) as BasicUserAuthProgrammerModel;
		} catch {
			return null;
		}
	}

	/** Call when auth check fails or layout load errors so navigation still completes and UI shows signed-out state. */
	public forceUnauthenticated(): void {
		this.clearTokens();
		this.clearUser();
		this.currentUser = null;
		this.currentAuthStatus.status = AuthStatus.UNAUTHENTICATED;
	}

	private clearTokens(): void {
		if (typeof window === 'undefined') return;
		this.inMemoryToken = null;
		localStorage.removeItem(this.config.storageKeys.token);
		localStorage.removeItem(this.config.storageKeys.refreshToken);
	}

	private clearUser(): void {
		if (typeof window === 'undefined') return;
		localStorage.removeItem(this.config.storageKeys.user);
	}

	private isSignoutRefreshSuppressed(): boolean {
		if (typeof window === 'undefined') return false;
		try {
			const raw = localStorage.getItem(SIGNOUT_REFRESH_SUPPRESSION_KEY);
			if (!raw) return false;
			const until = Number(raw);
			if (!Number.isFinite(until) || until <= 0) return false;
			if (Date.now() >= until) {
				// Expired: clear so future loads can refresh normally.
				localStorage.removeItem(SIGNOUT_REFRESH_SUPPRESSION_KEY);
				return false;
			}
			return true;
		} catch {
			return false;
		}
	}

	private isRefreshFailureSuppressed(): boolean {
		if (typeof window === 'undefined') return false;
		try {
			const raw = localStorage.getItem(REFRESH_FAILURE_SUPPRESSION_KEY);
			if (!raw) return false;
			const until = Number(raw);
			if (!Number.isFinite(until) || until <= 0) return false;
			if (Date.now() >= until) {
				// Expired: clear so future loads can refresh normally.
				localStorage.removeItem(REFRESH_FAILURE_SUPPRESSION_KEY);
				return false;
			}
			return true;
		} catch {
			return false;
		}
	}

	private suppressRefreshFailures(): void {
		if (typeof window === 'undefined') return;
		localStorage.setItem(
			REFRESH_FAILURE_SUPPRESSION_KEY,
			String(Date.now() + REFRESH_FAILURE_SUPPRESSION_MS)
		);
	}

	private clearRefreshFailureSuppression(): void {
		if (typeof window === 'undefined') return;
		try {
			localStorage.removeItem(REFRESH_FAILURE_SUPPRESSION_KEY);
		} catch {
			// ignore
		}
	}

	private clearSignoutRefreshSuppression(): void {
		if (typeof window === 'undefined') return;
		try {
			localStorage.removeItem(SIGNOUT_REFRESH_SUPPRESSION_KEY);
		} catch {
			// ignore
		}
	}

	private setupAuthInterceptor(): void {
		this.httpGateway.addRequestInterceptor((options) => {
			if (options.skipInterceptors) return options;
			const token = this.getToken();
			if (token) {
				return {
					...options,
					headers: {
						...options.headers,
						Authorization: `Bearer ${token}`
					}
				};
			}
			return options;
		});
	}

	private setupTokenRefresh(): void {
		if (typeof window === 'undefined') return;
		if (this.refreshTimer !== null) {
			clearTimeout(this.refreshTimer);
			this.refreshTimer = null;
		}
		try {
			const expiresAt = this.inMemoryToken?.expiration
				? this.inMemoryToken.expiration
				: (() => {
						if (!dev) return Date.now() + TOKEN_EXPIRATION_MS;
						const raw = localStorage.getItem(this.config.storageKeys.token);
						if (!raw) return Date.now() + TOKEN_EXPIRATION_MS;
						const parsed = JSON.parse(raw) as { expiration?: number };
						return parsed?.expiration ?? Date.now() + TOKEN_EXPIRATION_MS;
					})();
			const refreshBefore = 5 * 60 * 1000; // 5 min
			const delay = Math.max(0, expiresAt - refreshBefore - Date.now());
			this.refreshTimer = setTimeout(() => {
				this.refreshToken().catch(() => {});
			}, delay);
		} catch {
			// ignore
		}
	}
}
