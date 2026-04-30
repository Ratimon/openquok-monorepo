<script lang="ts">
	import Button from '$lib/ui/buttons/Button.svelte';
	import EditorPost from '$lib/ui/components/posts/EditorPost.svelte';
	import Switch from '$lib/ui/switch/switch.svelte';

	type Props = {
		enabled?: boolean;
		message?: string;
		disabled?: boolean;
	};

	let { enabled = $bindable(false), message = $bindable("That's a wrap!"), disabled = false }: Props = $props();

	const softCharLimit = 500;
	let charCount = $derived((message ?? '').length);
</script>

<div class="border-base-300 bg-base-200/20 rounded-lg border p-4">
	<div class="flex items-center justify-between gap-3">
		<div class="text-sm font-medium text-base-content/80">Add a thread finisher</div>
		<Switch bind:checked={enabled} disabled={disabled} />
	</div>

	<div class="mt-4 {enabled ? '' : 'opacity-40 pointer-events-none'}">
		<EditorPost
			charCount={charCount}
			softCharLimit={softCharLimit}
			bind:body={message}
			busy={disabled}
			comments={true}
			commentsMode={true}
		/>
		<div class="mt-2 flex items-center justify-end">
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={!enabled || disabled}
				onclick={() =>
					(message =
						"That's a wrap!\n\nIf you enjoyed this thread:\n\n1. Follow me for more\n2. Share the post below")}
			>
				Reset
			</Button>
		</div>
	</div>
</div>

