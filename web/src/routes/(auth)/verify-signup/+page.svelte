<script lang="ts">
	import { VerifyEmailStatus } from '$lib/user-auth/VerifyEmail.presenter.svelte';
	import { SignupStatus } from '$lib/user-auth/Signup.presenter.svelte';
	import { onMount } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { toast } from '$lib/ui/sonner';
	import { AuthStatus, authenticationRepository, verifyEmailPresenter, signupPresenter } from '$lib/user-auth/index';
	import { getRootPathAccount } from '$lib/area-protected/getRootPathProtectedArea';
	import { url } from '$lib/utils/path';
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardFooter
	} from '$lib/ui/card';

	// /account
	const rootPathAccount = getRootPathAccount();
	const accountPath = url(rootPathAccount);

	let verificationStatus = $derived(verifyEmailPresenter.status);
	let isVerifying = $derived(verificationStatus === VerifyEmailStatus.VERIFY_PENDING);
	let isConfirming = $derived(verificationStatus === VerifyEmailStatus.CONFIRMING);
	let isConfirmed = $derived(verificationStatus === VerifyEmailStatus.CONFIRMED);

	let isEmailResending = $derived(signupPresenter.status === SignupStatus.RESENDING_EMAIL);
	let showValidationSignupMessage = $derived(signupPresenter.showToastMessage);

	let tempToken = $state('');
	let tempEmail = $state('');
	let subscribeToNewsletter = $state(true);
	let message = $state<{ type: 'success' | 'error'; text: string } | null>(null);

	let hasVerificationToken = $derived(tempToken.length > 0);

	onMount(async () => {
		if (typeof window === 'undefined') return;
		const params = new URLSearchParams(window.location.search);
		tempToken = params.get('token') ?? '';
		tempEmail = params.get('email') ?? '';
		if (!tempEmail) {
			goto('/', { replaceState: true });
			return;
		}
		if (tempToken) {
			const allowed = await verifyEmailPresenter.checkIfUserIsAllowedToConfirmEmail(tempToken, tempEmail);
			if (!allowed) {
				goto('/', { replaceState: true });
			}
			return;
		}
		await authenticationRepository.checkAuth();
		const cu = authenticationRepository.currentUser;
		const emailsMatch =
			cu?.email?.trim().toLowerCase() === tempEmail.trim().toLowerCase();
		// Inline session check: `.svelte.ts` class instance types omit some methods (e.g. `isAuthenticated`) in TS.
		const sessionOk =
			authenticationRepository.currentAuthStatus.status === AuthStatus.AUTHENTICATED &&
			authenticationRepository.currentUser !== null;
		if (sessionOk && emailsMatch && cu?.isEmailVerified === true) {
			goto(accountPath, { replaceState: true });
			return;
		}
		if (!sessionOk || !emailsMatch) {
			goto('/', { replaceState: true });
		}
	});

	async function onSubmit() {
		message = null;
		if (!hasVerificationToken) {
			message = {
				type: 'error',
				text: 'Open the confirmation link in the email we sent you to complete verification.'
			};
			return;
		}
		let token = tempToken;
		if (!token && typeof window !== 'undefined') {
			token = new URLSearchParams(window.location.search).get('token') ?? '';
		}
		try {
			await verifyEmailPresenter.verifyEmail(token, subscribeToNewsletter);
			if (verifyEmailPresenter.status === VerifyEmailStatus.CONFIRMED) {
				message = { type: 'success', text: verifyEmailPresenter.toastMessage };
				signupPresenter.status = SignupStatus.SUCCESS;
				try {
					await authenticationRepository.checkAuth(undefined, { forceProfile: true });
				} catch {
					// Best-effort; goToAccount / protected layout also refresh
				}
				await invalidateAll();
				// Stay on this route so user sees Verified status
			} else if (verifyEmailPresenter.showToastMessage) {
				message = { type: 'error', text: verifyEmailPresenter.toastMessage };
			}
		} catch (err) {
			console.error('Verify error:', err);
			message = { type: 'error', text: verifyEmailPresenter.toastMessage || 'Verification failed.' };
		} finally {
			verifyEmailPresenter.showToastMessage = false;
		}
	}

	let waitTime = $state(20);
	let attemptCount = $state(0);
	let isCooldownActive = $derived(waitTime > 0);

	$effect(() => {
		if (waitTime > 0) {
			const t = setInterval(() => (waitTime = waitTime - 1), 1000);
			return () => clearInterval(t);
		}
	});

	async function onResend() {
		if (waitTime > 0) {
			const duration = waitTime;
			toast.loading(`You must wait ${waitTime} seconds before trying again.`, { duration });
			waitTime = waitTime + 20;
			return;
		}
		message = null;
		try {
			await signupPresenter.resendConfirmationEmail(tempEmail);
			if (isVerifying && showValidationSignupMessage) {
				toast.success(signupPresenter.toastMessage);
			}
			if (!isVerifying && showValidationSignupMessage) {
				toast.error(signupPresenter.toastMessage);
			}
		} catch (err) {
			console.error('Resend error:', err);
			toast.error('An error occurred while resending the confirmation email. Please try again later.');
		} finally {
			signupPresenter.showToastMessage = false;
			attemptCount += 1;
			if (attemptCount >= 2) waitTime = 30;
		}
	}

	async function goToAccount() {
		try {
			await authenticationRepository.checkAuth(undefined, { forceProfile: true });
		} catch {
			toast.error('Could not refresh your profile. Please wait a moment and try again.');
			return;
		}
		if (authenticationRepository.currentUser?.isEmailVerified !== true) {
			toast.error('Your email is not marked verified yet. Try refreshing the page.');
			return;
		}
		await goto(accountPath, { replaceState: true });
	}
</script>

<div class="mt-12 flex justify-center">
	<Card class="w-full max-w-2xl">
		<CardHeader>
			<CardTitle>
				<h3 class="text-2xl font-bold tracking-tight sm:text-3xl">
					Confirm your email address
				</h3>
			</CardTitle>
			<CardDescription>
				<div class="flex flex-row flex-wrap items-center justify-center gap-2 text-base">
					<span class="text-base-content/80 font-semibold">Your email: <span class="text-primary font-bold">{tempEmail}</span></span>
					{#if !isConfirmed}
						<AbstractIcon name={icons.CircleX.name} width="24" height="24" class="mx-1" />
						<span class="text-error font-bold">Unverified</span>
					{:else}
						<AbstractIcon name={icons.ShieldCheck.name} width="24" height="24" class="mx-1" />
						<span class="text-success font-bold">Verified</span>
					{/if}
				</div>
				<p class="mt-4 text-base-content/80">
					Click the button below to confirm that you own this account.
				</p>
				<p class="mt-2 text-base-content/80">
					By continuing, you may receive news about features and offers. You can unsubscribe at any time.
				</p>
				{#if hasVerificationToken}
					<div class="mt-6 flex items-center gap-2">
						<input
							type="checkbox"
							id="subscribe-newsletter"
							bind:checked={subscribeToNewsletter}
							disabled={isConfirming || isConfirmed}
							class="checkbox checkbox-sm"
						/>
						<label for="subscribe-newsletter" class="text-sm text-base-content/80">
							Subscribe to promotional offers and new features (optional).
						</label>
					</div>
				{/if}
			</CardDescription>
		</CardHeader>
		{#if message}
			<div
				class="mx-6 rounded-md p-3 text-sm {message.type === 'error'
					? 'bg-error/10 text-error'
					: 'bg-success/10 text-success'}"
			>
				{message.text}
			</div>
		{/if}
		<CardFooter class="flex flex-wrap gap-3">
			<Button
				variant="outline"
				type="button"
				class="flex-1 min-w-0"
				disabled={isEmailResending || isCooldownActive || isConfirmed}
				onclick={onResend}
			>
				{#if isEmailResending}
					<span class={isEmailResending ? 'animate-spin' : ''}>
						<AbstractIcon name={icons.LoaderCircle.name} width="24" height="24" focusable="false" />
					</span>
				{:else if isCooldownActive}
					Wait {waitTime}s to resend
				{:else}
					Resend confirmation email
				{/if}
			</Button>
			<Button
				type="button"
				class="flex-1 min-w-0"
				disabled={isConfirming || (!isConfirmed && !hasVerificationToken)}
				onclick={isConfirmed ? goToAccount : onSubmit}
			>
				{#if isConfirming}
					<span class={isConfirming ? 'animate-spin' : ''}>
						<AbstractIcon name={icons.LoaderCircle.name} width="24" height="24" focusable="false" />
					</span>
				{:else if isConfirmed}
					Go to Account Dashboard
				{:else}
					Complete your registration
				{/if}
			</Button>
		</CardFooter>
	</Card>
</div>
