<script lang="ts">
	import { ResetPasswordStatus } from '$lib/user-auth/ResetPassword.presenter.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { toast } from '$lib/ui/sonner';
	import {
		RESET_PASSWORD_CODE_MAX_LENGTH,
		RESET_PASSWORD_CODE_MIN_LENGTH,
		resetPasswordCodeSchema,
		resetPasswordEmailSchema,
		resetPasswordPresenter,
		signoutPresenter,
		SignoutStatus
	} from '$lib/user-auth/index';
	import {
		getRootPathSignin,
		getRootPathForgotPassword
	} from '$lib/user-auth/constants/getRootpathUserAuth';
	import { absoluteUrl, route } from '$lib/utils/path';
	import { accountChangePasswordFormSchema, editorAccountSettingsPresenter } from '$lib/account';
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent,
		CardFooter
	} from '$lib/ui/card';
	import { RecoveryCodeInput } from '$lib/ui/input-otp/index.js';

	// /sign-in
	const rootPathSignIn = getRootPathSignin();
	const signInPath = route(rootPathSignIn);
	const signinUrl = absoluteUrl(signInPath);
	// /forgot-password
	const rootPathForgotPassword = getRootPathForgotPassword();
	const forgotPasswordPath = route(rootPathForgotPassword);
	const forgotPasswordUrl = absoluteUrl(forgotPasswordPath);

	let status = $derived(resetPasswordPresenter.status);
	let isRequestNotSent = $derived(status === ResetPasswordStatus.UNKNOWN);
	let isRequestSubmitting = $derived(status === ResetPasswordStatus.RESET_REQUEST_SUBMITTING);
	let isRequestSent = $derived(status === ResetPasswordStatus.RESET_REQUEST_SENT);
	let isVerifyCodePending = $derived(status === ResetPasswordStatus.CODE_VERIFICATION_PENDING);
	let isVerifyCodeSubmitting = $derived(status === ResetPasswordStatus.CODE_VERIFICATION_SUBMITTING);
	let isNewPasswordPending = $derived(status === ResetPasswordStatus.NEW_PASSWORD_PENDING);
	let showToastMessage = $derived(resetPasswordPresenter.showToastMessage);
	let toastMsg = $derived(resetPasswordPresenter.toastMessage);

	let email = $state('');
	let code = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let showPassword = $state(false);
	let isUpdatingPassword = $state(false);
	let verifyType = $state<'recovery'>('recovery');

	let waitTime = $state(0);
	let attemptCount = $state(0);
	let isCooldownActive = $derived(waitTime > 0);
	let canSubmitCode = $derived(
		code.length >= RESET_PASSWORD_CODE_MIN_LENGTH && code.length <= RESET_PASSWORD_CODE_MAX_LENGTH
	);

	/** Show 6 cells until the user types or pastes a longer code (Supabase sends 6 or 8 digits). */
	let pinCellCount = $derived(
		Math.min(
			RESET_PASSWORD_CODE_MAX_LENGTH,
			Math.max(RESET_PASSWORD_CODE_MIN_LENGTH, code.length || RESET_PASSWORD_CODE_MIN_LENGTH)
		)
	);

	$effect(() => {
		if (waitTime > 0) {
			const t = setInterval(() => (waitTime = waitTime - 1), 1000);
			return () => clearInterval(t);
		}
	});

	onMount(() => {
		const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
		email = params.get('email') ?? '';
		const typeParam = params.get('type');
		if (typeParam === 'recovery') verifyType = 'recovery';
		if (params.get('confirm') === 'true') {
			resetPasswordPresenter.status = ResetPasswordStatus.CODE_VERIFICATION_PENDING;
		}
	});

	async function onRequestReset() {
		if (isCooldownActive) {
			toast.error(`Please wait ${waitTime} seconds before trying again.`);
			return;
		}
		const emailResult = resetPasswordEmailSchema.safeParse(email);
		if (!emailResult.success) {
			toast.error(emailResult.error.issues.map((i) => i.message).join(' '));
			return;
		}
		try {
			await resetPasswordPresenter.resetPassword(email);
			if (isRequestSent && showToastMessage) toast.success(toastMsg);
			if (!isRequestSent && showToastMessage) toast.error(toastMsg);
		} catch (err) {
			console.error('Reset password error:', err);
			toast.error('An error occurred. Please try again.');
		} finally {
			resetPasswordPresenter.showToastMessage = false;
			attemptCount += 1;
			if (attemptCount >= 2) waitTime = 20;
		}
	}

	async function onSubmitCode() {
		const codeResult = resetPasswordCodeSchema.safeParse(code);
		if (!codeResult.success) {
			toast.error(codeResult.error.issues.map((i) => i.message).join(' '));
			return;
		}
		try {
			await resetPasswordPresenter.verifyReset(email, code, verifyType);
			if (isNewPasswordPending && showToastMessage) {
				toast.success(toastMsg);
			}
			if (!isNewPasswordPending && showToastMessage) {
				toast.error(toastMsg);
				goto(forgotPasswordUrl, { replaceState: true });
			}
		} catch (err) {
			console.error('Verify code error:', err);
			toast.error('An error occurred while verifying your code.');
		} finally {
			resetPasswordPresenter.showToastMessage = false;
		}
	}

	async function onSubmitNewPassword() {
		const parsed = accountChangePasswordFormSchema.safeParse({ newPassword, confirmPassword });
		if (!parsed.success) {
			toast.error(parsed.error.issues.map((i) => i.message).join(' '));
			return;
		}
		isUpdatingPassword = true;
		try {
			const result = await editorAccountSettingsPresenter.updatePassword(parsed.data.newPassword);
			if (!result.success) {
				toast.error(result.message);
				return;
			}
			toast.success('Password updated. Sign in with your new password.');
			await signoutPresenter.signout();
			if (signoutPresenter.status === SignoutStatus.SUCCESS) {
				goto(signinUrl, { replaceState: true });
			}
		} catch (err) {
			console.error('Update password error:', err);
			toast.error('Could not update your password. Please try again.');
		} finally {
			isUpdatingPassword = false;
		}
	}
</script>

{#if isRequestNotSent || isRequestSubmitting}
	<div class="mt-12 flex">
		<div class="mx-auto grid max-w-3xl space-y-6">
			<Card class="w-full max-w-sm">
				<CardHeader>
					<CardTitle>
						<h1 class="text-xl font-semibold leading-none tracking-tight">
							Forgot password</h1>
					</CardTitle>
					<CardDescription>
						Enter your email to receive a reset code.
					</CardDescription>
				</CardHeader>
				<CardContent class="grid gap-4">
					<label class="block">
						<span class="block text-sm font-medium text-base-content">Email</span>
						<input
							name="email"
							type="email"
							placeholder="you@example.com"
							required
							bind:value={email}
							class="input input-bordered mt-1 w-full"
						/>
					</label>
				</CardContent>
				<CardFooter>
					<Button
						type="button"
						class="w-full"
						disabled={isRequestSubmitting || isCooldownActive}
						onclick={onRequestReset}
					>
						{#if isRequestSubmitting}
							<span class="animate-spin">
								<AbstractIcon name={icons.LoaderCircle.name} width="24" height="24" focusable="false" />
							</span>
						{:else if isCooldownActive}
							Wait {waitTime}s
						{:else}
							Request reset code
						{/if}
					</Button>
				</CardFooter>
			</Card>
			<p class="text-center text-sm text-base-content/80">
				<a href={signinUrl} class="font-medium text-primary underline hover:no-underline">Back to sign in</a>
			</p>
		</div>
	</div>

{:else if isRequestSent}
	<div class="mt-12 flex justify-center">
		<Card class="w-full max-w-md">
			<CardHeader>
				<CardTitle>
					<h1 class="text-xl font-semibold leading-none tracking-tight">
						Check your email</h1>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-base-content/80">
					We sent a reset code to <strong>{email}</strong>. Use the link in the email or enter the code on the next screen.
				</p>
			</CardContent>
			<CardFooter>
				<Button type="button" class="w-full">
					<a href={signinUrl}>Back to sign in</a>
				</Button>
			</CardFooter>
		</Card>
	</div>

{:else if isVerifyCodePending || isVerifyCodeSubmitting}
	<div class="mt-12 flex justify-center">
		<div class="w-full max-w-md space-y-4">
			<Card class="w-full">
				<CardHeader>
					<CardTitle>
						<h1 class="text-xl font-semibold leading-none tracking-tight">
							Enter your code
						</h1>
					</CardTitle>
					<CardDescription>
						Enter every digit from the email we sent to {email}. Codes are usually {RESET_PASSWORD_CODE_MIN_LENGTH} or {RESET_PASSWORD_CODE_MAX_LENGTH} digits.
					</CardDescription>
				</CardHeader>
				<CardContent class="grid gap-4">
					<div class="block">
						<span class="mb-2 block text-sm font-medium text-base-content">Code</span>
						<RecoveryCodeInput
							name="code"
							bind:value={code}
							maxlength={RESET_PASSWORD_CODE_MAX_LENGTH}
							displayLength={pinCellCount}
							disabled={isVerifyCodeSubmitting}
						/>
					</div>
				</CardContent>
				<CardFooter>
					<Button
						type="button"
						class="w-full"
						disabled={isVerifyCodeSubmitting || !canSubmitCode}
						onclick={onSubmitCode}
					>
						{#if isVerifyCodeSubmitting}
							<span class="animate-spin">
								<AbstractIcon name={icons.LoaderCircle.name} width="24" height="24" focusable="false" />
							</span>
						{:else}
							Verify code
						{/if}
					</Button>
				</CardFooter>
			</Card>
			<p class="text-center text-sm text-base-content/80">
				<a href={forgotPasswordUrl} class="font-medium text-primary underline hover:no-underline">Request a new code</a>
			</p>
		</div>
	</div>

{:else if isNewPasswordPending}
	<div class="mt-12 flex justify-center">
		<Card class="w-full max-w-md">
			<CardHeader>
				<CardTitle>
					<h1 class="text-xl font-semibold leading-none tracking-tight">Choose a new password</h1>
				</CardTitle>
				<CardDescription>
					Your code was verified. Set a new password for {email}. You do not need a paid plan to complete this step.
				</CardDescription>
			</CardHeader>
			<CardContent class="grid gap-4">
				<label class="block">
					<span class="block text-sm font-medium text-base-content">New password</span>
					<input
						type={showPassword ? 'text' : 'password'}
						bind:value={newPassword}
						autocomplete="new-password"
						minlength={8}
						class="input input-bordered mt-1 w-full"
						disabled={isUpdatingPassword}
					/>
				</label>
				<label class="block">
					<span class="block text-sm font-medium text-base-content">Confirm new password</span>
					<input
						type={showPassword ? 'text' : 'password'}
						bind:value={confirmPassword}
						autocomplete="new-password"
						class="input input-bordered mt-1 w-full"
						disabled={isUpdatingPassword}
					/>
				</label>
				<button
					type="button"
					class="text-left text-xs text-primary hover:underline"
					onclick={() => (showPassword = !showPassword)}
				>
					{showPassword ? 'Hide passwords' : 'Show passwords'}
				</button>
			</CardContent>
			<CardFooter>
				<Button
					type="button"
					class="w-full"
					disabled={isUpdatingPassword}
					onclick={onSubmitNewPassword}
				>
					{#if isUpdatingPassword}
						<span class="animate-spin">
							<AbstractIcon name={icons.LoaderCircle.name} width="24" height="24" focusable="false" />
						</span>
					{:else}
						Update password
					{/if}
				</Button>
			</CardFooter>
		</Card>
	</div>
{/if}
