<script lang="ts">
	import * as Dialog from '$lib/ui/dialog';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		open: boolean;
		targetTimeLabel: string;
		isRecurring?: boolean;
		busy?: boolean;
		onOpenChange: (open: boolean) => void;
		onUpdateDetails: () => void;
		onReschedulePost: () => void;
	};

	let {
		open,
		targetTimeLabel,
		isRecurring = false,
		busy = false,
		onOpenChange,
		onUpdateDetails,
		onReschedulePost
	}: Props = $props();
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content class="max-w-md gap-4" showCloseButton={!busy}>
		<Dialog.Header>
			<Dialog.Title>
				Reschedule published post?
			</Dialog.Title>
			<Dialog.Description class="text-base-content/70">
				This post has already been published or its scheduled time has passed. Moving it to
				<strong class="font-medium text-base-content">{targetTimeLabel}</strong> can either update the
				stored time only or queue a new publish.
			</Dialog.Description>
		</Dialog.Header>

		{#if isRecurring}
			<p class="text-sm text-warning">
				This is a recurring post: your changes apply to all future recurrences starting now.
			</p>
		{/if}

		<Dialog.Footer class="flex-col gap-2 sm:flex-col sm:items-stretch">
			<Button
				type="button"
				variant="secondary"
				class="w-full justify-center"
				disabled={busy}
				onclick={() => onUpdateDetails()}
			>
				Just update the post details
			</Button>
			<Button
				type="button"
				class="w-full justify-center"
				disabled={busy}
				onclick={() => onReschedulePost()}
			>
				Reschedule the post
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
