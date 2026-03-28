<script lang="ts">
	import { FeedbackStatus } from '$lib/feedback/Feedback.presenter.svelte';
	import type { CreateFeedbackProgrammerModel } from '$lib/feedback/Feedback.repository.svelte';

	import { toast } from '$lib/ui/sonner';
	import { z } from 'zod';

	import { getRootPathSignin } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { absoluteUrl } from '$lib/utils/path';

	import Button from '$lib/ui/buttons/Button.svelte';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogHeader,
		DialogTitle
	} from '$lib/ui/dialog';
	import { Input } from '$lib/ui/input';
	import { Textarea } from '$lib/ui/textarea';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { icons } from '$data/icon';

	const rootPathSignin = getRootPathSignin();
	const signinUrl = absoluteUrl(rootPathSignin);

	type Props = {
		status: FeedbackStatus;
		feedbackType: 'propose' | 'report' | 'feedback';
		/** If true, trigger button is fixed bottom-right. */
		fixed?: boolean;
		isLoggedIn?: boolean;
		/** Shown in error toast when `createFeedback` returns null. */
		toastMessage: string;
		feedbackTitle: string;
		feedbackDescription: string;
		ModalSuccessMessage: string;
		url: string;
		handleCreateFeedback: (
			feedbackType: 'propose' | 'report' | 'feedback',
			url: string,
			description: string,
			email: string
		) => Promise<CreateFeedbackProgrammerModel | null>;
		handleReset: () => void;
	};

	let {
		status,
		feedbackType,
		fixed = true,
		isLoggedIn = false,
		toastMessage,
		feedbackTitle,
		feedbackDescription,
		ModalSuccessMessage,
		url,
		handleCreateFeedback,
		handleReset
	}: Props = $props();

	let dialogOpen = $state(false);
	let description = $state('');
	let email = $state('');

	let isSubmitting = $derived(status === FeedbackStatus.SUBMITTING);
	let isSuccess = $derived(status === FeedbackStatus.SUCCESS);

	const descriptionRequirements = z.string().min(10, { message: 'be at least 10 characters long.' });
	const emailRequirements = z
		.string()
		.email('Please enter a valid email.')
		.regex(/^[^+]+$/, { message: "Email may not include a '+' sign" })
		.trim();
	const urlRequirements = z
		.string()
		.url({ message: 'must be a valid URL' })
		.min(3, { message: 'be at least 3 characters long.' });

	function closeAndReset() {
		dialogOpen = false;
	}

	function onDialogOpenChange(open: boolean) {
		if (!open) {
			description = '';
			email = '';
			handleReset();
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		const safeParseUrl = urlRequirements.safeParse(url);
		const safeParseDescription = descriptionRequirements.safeParse(description);

		if (!safeParseUrl.success) {
			const messages = safeParseUrl.error.issues.map((e) => e.message).join(' ');
			toast.error(`URL must ${messages}`);
			return;
		}

		if (!safeParseDescription.success) {
			const messages = safeParseDescription.error.issues.map((e) => e.message).join(' ');
			toast.error(`Description must ${messages}`);
			return;
		}

		if (email && email.trim() !== '') {
			const safeParseEmail = emailRequirements.safeParse(email);
			if (!safeParseEmail.success) {
				const messages = safeParseEmail.error.issues.map((e) => e.message).join(' ');
				toast.error(`Email must ${messages}`);
				return;
			}
		}

		try {
			const resultPm = await handleCreateFeedback(feedbackType, url, description, email);
			if (resultPm?.success) {
				toast.success(resultPm.message || 'Thank you.');
			} else {
				toast.error(toastMessage || 'Could not submit feedback.');
			}
		} catch (err) {
			console.error('Error submitting feedback:', err);
			toast.error('An error occurred while submitting feedback. Please try again later.');
		}
	}
</script>

<Dialog bind:open={dialogOpen} onOpenChange={onDialogOpenChange}>
	<Button
		variant="secondary"
		type="button"
		class={fixed ? 'rounded-md fixed bottom-5 right-5 z-50' : 'rounded-md w-full'}
		onclick={() => (dialogOpen = true)}
	>
		<span class="flex items-center gap-2">
			<AbstractIcon name={icons.MessageCircle.name} width="20" height="20" focusable="false" />
			<span>{feedbackTitle}</span>
		</span>
		<span class="sr-only">Feedback</span>
	</Button>

	<DialogContent class="sm:max-w-[425px]">
		<DialogHeader>
			<DialogTitle>{feedbackTitle}</DialogTitle>
			<DialogDescription>{feedbackDescription}</DialogDescription>
		</DialogHeader>

		{#if !isSuccess}
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleSubmit(e);
				}}
				class="grid gap-4"
			>
				<input type="hidden" name="feedback_type" value={feedbackType} />
				<input type="hidden" name="url" value={url} />

				{#if !isLoggedIn}
					<div class="rounded-md border border-warning/20 bg-warning/10 p-4 text-sm text-warning">
						<p>You need to sign in first to {feedbackTitle.toLowerCase()}.</p>
					</div>
				{:else}
					<div>
						<label for="feedback-description" class="text-sm font-medium text-base-content/70">
							Description
						</label>
						<Textarea
							id="feedback-description"
							bind:value={description}
							placeholder="I would like to see..."
							rows={4}
							required
							class="mt-1.5"
						/>
					</div>

					<div>
						<label for="feedback-email" class="text-sm font-medium text-base-content/70">
							Your email (optional, if you want to hear from us)
						</label>
						<Input
							id="feedback-email"
							placeholder="you@example.com"
							name="email"
							type="email"
							bind:value={email}
							class="mt-1.5"
						/>
					</div>
				{/if}

				<div class="mt-2 flex gap-2">
					{#if !isLoggedIn}
						<Button variant="outline" size="lg" href={signinUrl} class="flex-1">
							Sign in
						</Button>
					{/if}
					<Button
						variant="primary"
						type="submit"
						size="lg"
						disabled={isSubmitting || !isLoggedIn}
						class={isLoggedIn ? 'w-full' : 'flex-1'}
					>
						{#if isSubmitting}
							<span class="flex items-center gap-2">
								<span>Submitting...</span>
								<span class="loading loading-spinner loading-sm"></span>
							</span>
						{:else}
							Submit
						{/if}
					</Button>
				</div>
			</form>
		{:else}
			<p class="max-w-xl text-sm text-base-content">
				{ModalSuccessMessage}
			</p>
			<Button variant="outline" type="button" class="mt-4 w-full" onclick={() => closeAndReset()}>
				Close
			</Button>
		{/if}
	</DialogContent>
</Dialog>
