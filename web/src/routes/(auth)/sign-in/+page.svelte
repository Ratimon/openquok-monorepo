<script lang="ts">
	import { SigninStatus } from '$lib/user-auth/Signin.presenter.svelte';
	import { SignupStatus } from '$lib/user-auth/Signup.presenter.svelte';
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import { createForm } from '@tanstack/svelte-form';
	import { toast } from '$lib/ui/sonner';
	import {
		getPostSigninRedirectTarget,
		signinFormSchema,
		signinPresenter,
		signupPresenter
	} from '$lib/user-auth/index';
	import { getRootPathSignup, getRootPathForgotPassword } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { getRootPathAccount } from '$lib/area-protected/getRootPathProtectedArea';
	import { absoluteUrl, url } from '$lib/utils/path';
	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Field from '$lib/ui/field';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent,
		CardFooter
	} from '$lib/ui/card';
	import SignInWithGoogleButton from '$lib/ui/components/social-login/SignInWithGoogleButton.svelte';

	const signupPath = getRootPathSignup();
	const signupUrl = absoluteUrl(`/${signupPath}`);
	const forgotPath = getRootPathForgotPassword();
	const forgotPasswordUrl = absoluteUrl(`/${forgotPath}`);

	function getRedirectURL(): string {
		const accountPath = url(getRootPathAccount());
		if (typeof window !== 'undefined') {
			const wParams = new URLSearchParams(window.location.search);
			if (wParams.get('redirectURL')) {
				return getPostSigninRedirectTarget(wParams, accountPath);
			}
		}
		return getPostSigninRedirectTarget(page.url.searchParams, accountPath);
	}

	let companyName = $derived((page.data as App.LayoutData)?.companyNameVm ?? 'Openquok');
	let googleOAuthNext = $derived(getRedirectURL());
	let status = $derived(signinPresenter.status);
	let isSigningIn = $derived(status === SigninStatus.SUBMITTING);
	let showPassword = $state(false);
	let showResendVerification = $state(false);
	let lastEmail = $state('');
	let waitTime = $state(0);
	let attemptCount = $state(0);

	let isEmailResending = $derived(signupPresenter.status === SignupStatus.RESENDING_EMAIL);
	let isCooldownActive = $derived(waitTime > 0);

	$effect(() => {
		if (waitTime > 0) {
			const t = setInterval(() => (waitTime = waitTime - 1), 1000);
			return () => clearInterval(t);
		}
	});

	const form = createForm(() => ({
		defaultValues: {
			email: '',
			password: ''
		},
		validators: {
			onChange: signinFormSchema
		},
		onSubmit: async ({ value }) => {
			try {
				await signinPresenter.signin(value.email, value.password);
				const currentStatus = signinPresenter.status;
				const isSuccess = currentStatus === SigninStatus.SUCCESS;
				const showToastMessage = signinPresenter.showToastMessage;
				if (isSuccess && showToastMessage) {
					toast.success(signinPresenter.toastMessage);
					signinPresenter.showToastMessage = false;
					const redirectUrl = getRedirectURL();
					// Navigate first so layout loads run for destination URL with auth already set; then refresh data to avoid invalidateAll/goto race
					await goto(redirectUrl, { replaceState: true });
					invalidateAll();
				} else if (!isSuccess && showToastMessage) {
					toast.error(signinPresenter.toastMessage);
					signinPresenter.showToastMessage = false;
					const isNotVerified = signinPresenter.toastMessage.toLowerCase().includes('not verified');
					if (isNotVerified) {
						lastEmail = value.email;
						showResendVerification = true;
					}
				}
			} catch (err) {
				console.error('Sign in error:', err);
				if (signinPresenter.status !== SigninStatus.SUCCESS) {
					toast.error('An error occurred while signing in. Please try again.');
				}
				signinPresenter.showToastMessage = false;
			}
		}
	}));

	async function onResendVerification() {
		if (waitTime > 0) return;
		const emailResult = signinFormSchema.shape.email.safeParse(lastEmail);
		if (!emailResult.success) {
			toast.error(emailResult.error.issues.map((i) => i.message).join(' '));
			return;
		}
		try {
			await signupPresenter.resendConfirmationEmail(lastEmail);
			if (signupPresenter.status === SignupStatus.VERIFYING_EMAIL && signupPresenter.showToastMessage) {
				toast.success(signupPresenter.toastMessage);
			} else if (signupPresenter.showToastMessage) {
				toast.error(signupPresenter.toastMessage);
			}
		} catch (err) {
			console.error('Resend verification error:', err);
			toast.error('Failed to resend verification email.');
		} finally {
			signupPresenter.showToastMessage = false;
			attemptCount += 1;
			if (attemptCount >= 2) waitTime = 30;
		}
	}

	function backToSignIn() {
		showResendVerification = false;
	}

	function handleFormSubmit(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		if (form.state.errors && form.state.errors.length > 0 && form.state.errors[0]) {
			Object.entries(form.state.errors[0] as Record<string, Array<{ message?: string }>>).forEach(
				([, errors]) => {
					errors.forEach((err) => toast.error(err?.message ?? 'Invalid field'));
				}
			);
			return;
		}
		form.handleSubmit();
	}
</script>

<div class="mt-12 flex">
	<div class="mx-auto grid max-w-3xl space-y-6">
		{#if showResendVerification}
			<div class="mx-auto max-w-md pt-12 text-center">
				<AbstractIcon name={icons.MailOpen.name} width="48" height="48" />
				<h2 class="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
					Verify your email</h2>
				<p class="mt-2 text-base-content/80">
					Your account <strong>{lastEmail}</strong> is not verified yet. We can send you a new verification link.
				</p>
				{#if signupPresenter.toastMessage}
					<p class="mt-4 text-primary">
						{signupPresenter.toastMessage}</p>
				{/if}
				<p class="mt-4 text-base-content/70">
					Click below to resend the confirmation email. Check your inbox (and spam folder).
				</p>
				<Button
					variant="outline"
					type="button"
					class="w-full mt-4"
					disabled={isEmailResending || isCooldownActive}
					onclick={onResendVerification}
				>
					{#if isEmailResending}
						<span class={isEmailResending ? 'animate-spin' : ''}>
							<AbstractIcon name={icons.LoaderCircle.name} width="24" height="24" focusable="false" />
						</span>
					{:else if isCooldownActive}
						Wait {waitTime}s
					{:else}
						Resend verification email
					{/if}
				</Button>
				<button
					type="button"
					class="mt-6 text-sm font-medium text-primary underline hover:no-underline"
					onclick={backToSignIn}
				>
					Back to sign in
				</button>
			</div>
		{:else}
			<Card class="w-full max-w-sm">
				<CardHeader>
					<CardTitle>
						<h1 class="text-xl font-semibold leading-none tracking-tight">
							Sign in to {companyName}
						</h1>
					</CardTitle>
					<CardDescription>
						Sign in to your account to continue.
					</CardDescription>
				</CardHeader>
				<CardContent class="grid gap-4">
					<form onsubmit={handleFormSubmit}>
						<form.Field name="email">
							{#snippet children(field)}
								<label class="block">
									<Field.Label field={field} for="signin-email">Email</Field.Label>
									<input
										id="signin-email"
										name="email"
										type="email"
										placeholder="you@example.com"
										required
										value={field.state.value}
										onblur={field.handleBlur}
										oninput={(e) => field.handleChange(e.currentTarget.value)}
										class="input input-bordered mt-1 w-full"
									/>
									<Field.Error
										errors={field.state.meta.errors as unknown as Array<{ message?: string }>}
									/>
								</label>
							{/snippet}
						</form.Field>
						<form.Field name="password">
							{#snippet children(field)}
								<label class="block">
									<div class="flex items-center justify-between">
										<Field.Label field={field}>Password</Field.Label>
										<button
											type="button"
											class="text-primary hover:underline text-xs"
											onclick={() => (showPassword = !showPassword)}
											aria-label={showPassword ? 'Hide password' : 'Show password'}
										>
											<AbstractIcon
												name={icons.Eye.name}
												width="20"
												height="20"
												focusable="false"
												class={showPassword ? 'opacity-50' : ''}
											/>
										</button>
									</div>
									<input
										id="signin-password"
										name="password"
										type={showPassword ? 'text' : 'password'}
										placeholder="Your password"
										required
										value={field.state.value}
										onblur={field.handleBlur}
										oninput={(e) => field.handleChange(e.currentTarget.value)}
										class="input input-bordered mt-1 w-full"
									/>
									<Field.Error
										errors={field.state.meta.errors as unknown as Array<{ message?: string }>}
									/>
								</label>
							{/snippet}
						</form.Field>
						<CardFooter>
							<form.Subscribe
								selector={(state) => ({
									isSubmitting: state.isSubmitting
								})}
							>
								{#snippet children(state)}
									<Button
										type="submit"
										class="w-full"
										disabled={state.isSubmitting || isSigningIn}
									>
										{#if state.isSubmitting || isSigningIn}
											<span class="animate-spin">
												<AbstractIcon name={icons.LoaderCircle.name} width="24" height="24" focusable="false" />
											</span>
										{:else}
											Sign in
										{/if}
									</Button>
								{/snippet}
							</form.Subscribe>
						</CardFooter>
					</form>
					<div class="relative py-1">
						<div class="absolute inset-0 flex items-center" aria-hidden="true">
							<span class="w-full border-t border-base-content/20"></span>
						</div>
						<div class="relative flex justify-center text-xs font-medium uppercase tracking-wide">
							<span class="bg-base-100 px-2 text-base-content/60">Or continue with</span>
						</div>
					</div>
					<SignInWithGoogleButton next={googleOAuthNext} />
				</CardContent>
			</Card>

			<p class="text-center text-sm text-base-content/80">
				Don't have an account?
				<a href={signupUrl} class="font-medium text-primary underline hover:no-underline">Sign up</a>
			</p>
			<p class="text-center text-sm text-base-content/80">
				<a href={forgotPasswordUrl} class="font-medium text-primary underline hover:no-underline">Forgot password?</a>
			</p>
		{/if}
	</div>
</div>
