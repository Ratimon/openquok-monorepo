<script lang="ts">
	import { VerifyEmailStatus } from '$lib/user-auth/VerifyEmail.presenter.svelte';
	import { SignupStatus } from '$lib/user-auth/Signup.presenter.svelte';
	import { onMount } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import toast from 'svelte-hot-french-toast';
	import { verifyEmailPresenter, signupPresenter } from '$lib/user-auth/index';
	import { getRootPathAccount } from '$lib/area-protected/getRootPathProtectedArea';
	import { url } from '$lib/utils/path';
	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardFooter
	} from '$lib/ui/card';

	const accountPath = url(getRootPathAccount());

	let verificationStatus = $derived(verifyEmailPresenter.status);
	let isVerifying = $derived(verificationStatus === VerifyEmailStatus.VERIFY_PENDING);
	let isConfirming = $derived(verificationStatus === VerifyEmailStatus.CONFIRMING);
	let isConfirmed = $derived(verificationStatus === VerifyEmailStatus.CONFIRMED);
	let showVerifyMessage = $derived(verifyEmailPresenter.showToastMessage);

	let isEmailResending = $derived(signupPresenter.status === SignupStatus.RESENDING_EMAIL);
	let showValidationSignupMessage = $derived(signupPresenter.showToastMessage);

	let tempToken = $state('');
	let tempEmail = $state('');
	let subscribeToNewsletter = $state(true);
	let message = $state<{ type: 'success' | 'error'; text: string } | null>(null);

	onMount(async () => {
		if (typeof window === 'undefined') return;
		const params = new URLSearchParams(window.location.search);
		tempToken = params.get('token') ?? '';
		tempEmail = params.get('email') ?? '';
		if (!tempToken || !tempEmail) {
			goto('/', { replaceState: true });
			return;
		}
		const allowed = await verifyEmailPresenter.checkIfUserIsAllowedToConfirmEmail(tempToken, tempEmail);
		if (!allowed) {
			goto('/', { replaceState: true });
		}
	});

	async function onSubmit() {
		message = null;
		let token = tempToken;
		if (!token && typeof window !== 'undefined') {
			token = new URLSearchParams(window.location.search).get('token') ?? '';
		}
		try {
			await verifyEmailPresenter.verifyEmail(token, subscribeToNewsletter);
			if (isConfirmed && showVerifyMessage) {
				message = { type: 'success', text: verifyEmailPresenter.toastMessage };
				signupPresenter.status = SignupStatus.SUCCESS;
				await invalidateAll();
				// Stay on this route so user sees Verified status
			} else if (showVerifyMessage) {
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

	function goToAccount() {
		goto(accountPath, { replaceState: true });
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
				disabled={isConfirming}
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
