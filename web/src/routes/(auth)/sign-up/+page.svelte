<script lang="ts">
	import { SignupStatus } from '$lib/user-auth/Signup.presenter.svelte';
	import { createForm } from '@tanstack/svelte-form';
	import { toast } from '$lib/ui/sonner';
	import { signupFormFieldsSchema, signupFormSchema, signupPresenter } from '$lib/user-auth/index';
	import { getRootPathSignin } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { getRootPathAccount } from '$lib/area-protected/getRootPathProtectedArea';
	import { absoluteUrl, route, url } from '$lib/utils/path';
	import { icons } from '$data/icons';
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

	// /sign-in
	const rootPathSignIn = getRootPathSignin();
	const signInPath = route(rootPathSignIn);
	const signinUrl = absoluteUrl(signInPath);

	// /account
	const rootPathAccount = getRootPathAccount();
	const googleOAuthNext = url(rootPathAccount);

	let status = $derived(signupPresenter.status);
	let isSubmitting = $derived(status === SignupStatus.SUBMITTING);
	let isEmailResending = $derived(status === SignupStatus.RESENDING_EMAIL);
	let isEmailResended = $derived(status === SignupStatus.VERIFYING_EMAIL);

	let lastFullName = $state('');
	let lastEmail = $state('');
	let showPassword = $state(false);
	let waitTime = $state(30);
	let attemptCount = $state(0);
	let isCooldownActive = $derived(waitTime > 0);

	const form = createForm(() => ({
		defaultValues: {
			fullName: '',
			email: '',
			password: '',
			confirmPassword: ''
		},
		validators: {
			onChange: signupFormSchema
		},
		onSubmit: async ({ value }) => {
			// Set before signup() so they're available when status flips to SUBMITTED and the success view renders
			lastFullName = value.fullName;
			lastEmail = value.email;
			try {
				await signupPresenter.signup(value.fullName, value.email, value.password);
				if (signupPresenter.showToastMessage) {
					if (signupPresenter.status === SignupStatus.SUBMITTED) {
						toast.success(signupPresenter.toastMessage);
					} else {
						toast.error(signupPresenter.toastMessage);
					}
				}
			} catch (err) {
				console.error('Sign up error:', err);
				toast.error('An error occurred while signing up. Please try again.');
			} finally {
				signupPresenter.showToastMessage = false;
			}
		}
	}));

	$effect(() => {
		if (waitTime > 0) {
			const t = setInterval(() => (waitTime = waitTime - 1), 1000);
			return () => clearInterval(t);
		}
	});

	async function onResend() {
		if (waitTime > 0) return;
		const emailResult = signupFormFieldsSchema.shape.email.safeParse(lastEmail);
		if (!emailResult.success) {
			toast.error(emailResult.error.issues.map((i) => i.message).join(' '));
			return;
		}
		try {
			await signupPresenter.resendConfirmationEmail(lastEmail);
			if (isEmailResended && signupPresenter.showToastMessage) {
				toast.success(signupPresenter.toastMessage);
			} else if (signupPresenter.showToastMessage) {
				toast.error(signupPresenter.toastMessage);
			}
		} catch (err) {
			console.error('Resend error:', err);
			toast.error('Failed to resend confirmation email.');
		} finally {
			signupPresenter.showToastMessage = false;
			attemptCount += 1;
			if (attemptCount >= 2) waitTime = 30;
		}
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
		{#if status === SignupStatus.UNKNOWN || status === SignupStatus.SUBMITTING}
			<Card class="w-full max-w-sm">
				<CardHeader>
					<CardTitle>
						<h1 class="text-xl font-semibold leading-none tracking-tight">
							Create Your Account</h1>
					</CardTitle>
					<CardDescription>Sign up to continue.</CardDescription>
				</CardHeader>
				<CardContent class="grid gap-4">
					<form onsubmit={handleFormSubmit}>
						<form.Field name="fullName">
							{#snippet children(field)}
								<label class="block">
									<Field.Label field={field} for="signup-fullName">Full name</Field.Label>
									<input
										id="signup-fullName"
										name="fullName"
										type="text"
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
						<form.Field name="email">
							{#snippet children(field)}
								<label class="block">
									<Field.Label field={field} for="signup-email">Email</Field.Label>
									<input
										id="signup-email"
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
										id="signup-password"
										name="password"
										type={showPassword ? 'text' : 'password'}
										required
										value={field.state.value}
										onblur={field.handleBlur}
										oninput={(e) => field.handleChange(e.currentTarget.value)}
										class="input input-bordered mt-1 w-full"
									/>
									<Field.Description>At least 8 characters, one letter, one number.</Field.Description>
									<Field.Error
										errors={field.state.meta.errors as unknown as Array<{ message?: string }>}
									/>
								</label>
							{/snippet}
						</form.Field>
						<form.Field name="confirmPassword">
							{#snippet children(field)}
								<label class="mt-4 block">
									<div class="flex items-center justify-between">
										<Field.Label field={field} for="signup-confirmPassword">Confirm password</Field.Label>
										<button
											type="button"
											class="text-primary hover:underline text-xs"
											onclick={() => (showPassword = !showPassword)}
											aria-label={showPassword ? 'Hide confirm password' : 'Show confirm password'}
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
										id="signup-confirmPassword"
										name="confirmPassword"
										type={showPassword ? 'text' : 'password'}
										required
										autocomplete="new-password"
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
							<form.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting })}>
								{#snippet children(state)}
									<Button
										type="submit"
										class="w-full"
										disabled={state.isSubmitting || isSubmitting}
									>
										{#if state.isSubmitting || isSubmitting}
											<span class="animate-spin">
												<AbstractIcon name={icons.LoaderCircle.name} width="24" height="24" focusable="false" />
											</span>
										{:else}
											Create Account
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
							<span class="bg-base-100 px-2 text-base-content/60">Or sign up with</span>
						</div>
					</div>
					<SignInWithGoogleButton next={googleOAuthNext} />
				</CardContent>
			</Card>
			<p class="text-center text-sm text-base-content/80">
				Already have an account?
				<a href={signinUrl} class="font-medium text-primary underline hover:no-underline">Sign in</a>
			</p>

		{:else if status === SignupStatus.SUBMITTED || status === SignupStatus.RESENDING_EMAIL || status === SignupStatus.VERIFYING_EMAIL}
			<div class="mx-auto max-w-md pt-12 text-center">
				<AbstractIcon name={icons.MailOpen.name} width="48" height="48" />
				<h2 class="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
					One more step</h2>
				<p class="mt-2 text-base-content/80">
					Hi {lastFullName}, your account: {lastEmail}</p>
	
				{#if signupPresenter.toastMessage}
					<p class="mt-4 text-primary">
						{signupPresenter.toastMessage}</p>
				{/if}
				<p class="mt-3 text-base-content/90">
					Please check your inbox (and spam folder) to verify your email.
				</p>
				<p class="mt-4 text-base-content/70">
					Didn't receive the email? Click below to resend the confirmation email.
				</p>
				<Button
					variant="outline"
					type="button"
					class="w-full mt-4"
					disabled={isEmailResending || isCooldownActive}
					onclick={onResend}
				>
					{#if isEmailResending}
						<span class={isEmailResending ? 'animate-spin' : ''}>
							<AbstractIcon name={icons.LoaderCircle.name} width="24" height="24" focusable="false" />
						</span>
					{:else if isCooldownActive}
						Wait {waitTime}s
					{:else}
						Resend confirmation email
					{/if}
				</Button>
			</div>
			<p class="text-center text-sm text-base-content/80">
				Already verified the email?
				<a href={signinUrl} class="font-medium text-primary underline hover:no-underline">Sign in</a>
			</p>

		{:else}
			<div class="mx-auto max-w-md pt-12 text-center">
				<h2 class="text-2xl font-bold">
					Hi, {lastFullName}</h2>
				<p class="mt-4 text-base-content/80">
					We've sent you a verification email. Please check your inbox (and spam) and click the link to verify your account.
				</p>
				<Button href="/" class="mt-6">
					Go to home</Button>
			</div>
		{/if}
	</div>
</div>
