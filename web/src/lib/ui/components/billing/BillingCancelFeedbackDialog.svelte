<script lang="ts">
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import { Textarea } from '$lib/ui/textarea';

	type Props = {
		open?: boolean;
		busy: boolean;
		onOpenChange: (open: boolean) => void;
		onSubmit: (feedback: string) => void | Promise<void>;
	};

	let { open = $bindable(false), busy, onOpenChange, onSubmit }: Props = $props();

	let feedback = $state('');

	const canSubmit = $derived(feedback.trim().length >= 20);

	$effect(() => {
		if (!open) {
			feedback = '';
		}
	});
</script>

<Dialog.Root
	bind:open
	onOpenChange={(next: boolean) => {
		onOpenChange(next);
	}}
>
	<Dialog.Content class="max-w-lg" showCloseButton>
		<Dialog.Header>
			<Dialog.Title>We are sorry to see you go :(</Dialog.Title>
			<Dialog.Description>
				Would you mind shortly telling us what we could have done better?
			</Dialog.Description>
		</Dialog.Header>
		<div class="flex flex-col gap-4 py-2">
			<label class="flex flex-col gap-2 text-sm">
				<span class="font-medium">Feedback</span>
				<Textarea
					rows={4}
					placeholder="Your feedback helps us improve."
					bind:value={feedback}
					disabled={busy}
				/>
			</label>
			<Button
				variant="red"
				disabled={busy || !canSubmit}
				onclick={() => void onSubmit(feedback.trim())}
			>
				{canSubmit ? 'Cancel subscription' : 'Please add at least 20 characters'}
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
