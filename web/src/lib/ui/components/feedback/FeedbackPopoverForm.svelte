<script lang="ts">
	import type { FeedbackPopoverViewModel } from '$lib/feedback';
	import { feedbackDescriptionSchema } from '$lib/feedback/feedback.types';
	import { toast } from '$lib/ui/sonner';
	import * as Popover from '$lib/ui/popover';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { icons } from '$data/icon';

	type Props = Omit<FeedbackPopoverViewModel, 'description' | 'open'> & {
		description: string;
		open: boolean;
	};

	let {
		description = $bindable(''),
		open = $bindable(false),
		isSubmitting,
		isSuccess,
		successMessage,
		onSubmit
	}: Props = $props();

	async function handleSubmit(e: Event) {
		e.preventDefault();
		const result = feedbackDescriptionSchema.safeParse(description);
		if (!result.success) {
			toast.error(result.error.issues.map((i) => i.message).join(' '));
			return;
		}
		await onSubmit(result.data);
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		class="flex aspect-square items-center justify-center rounded-full bg-base-200 hover:bg-base-300 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-200 overflow-visible"
		aria-label="Feedback"
	>
		<div class="flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
			<AbstractIcon
				name={icons.Megaphone.name}
				width="20"
				height="20"
				class="shrink-0 text-base-content/70 group-hover:text-base-content transition-colors"
				focusable="false"
			/>
		</div>
	</Popover.Trigger>
	<Popover.Portal>
		<Popover.Content class="w-[320px] sm:w-[380px] p-0">
			{#if !isSuccess}
				<form onsubmit={handleSubmit} class="flex flex-col gap-3 p-4">
					<textarea
						bind:value={description}
						placeholder="Type your feedback here..."
						rows={4}
						class="w-full resize-none rounded-md border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content placeholder:text-base-content/50 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100"
						disabled={isSubmitting}
					></textarea>
					<p class="text-xs text-base-content/60">
						We don't respond to submissions, but we read all of them carefully.
					</p>
					<div class="flex justify-end">
						<Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
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
				<div class="p-4">
					<p class="text-sm text-base-content">
						{successMessage}</p>
				</div>
			{/if}
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>
