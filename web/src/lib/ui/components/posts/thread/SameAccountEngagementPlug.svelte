<script lang="ts">
	import Button from '$lib/ui/buttons/Button.svelte';
	import EditorPost from '$lib/ui/components/posts/EditorPost.svelte';
	import Switch from '$lib/ui/switch/switch.svelte';

	type Props = {
		enabled?: boolean;
		/** Seconds after publish before posting the extra reply */
		delaySeconds?: number;
		message?: string;
		disabled?: boolean;
	};

	let {
		enabled = $bindable(false),
		delaySeconds = $bindable(120),
		message = $bindable(''),
		disabled = false
	}: Props = $props();

	const softCharLimit = 500;
	let charCount = $derived((message ?? '').length);
</script>

<div class="border-base-300 bg-base-200/30 mt-6 rounded-lg border p-4">
	<div class="flex items-center justify-between gap-3">
		<div>
			<div class="text-sm font-medium text-base-content/80">Delayed engagement reply</div>
			<p class="mt-1 text-xs text-base-content/55">
				Same Threads account — schedules one extra reply after your main post (internal plug).
			</p>
		</div>
		<Switch bind:checked={enabled} disabled={disabled} />
	</div>

	<div class="mt-4 space-y-3 {enabled ? '' : 'opacity-40 pointer-events-none'}">
		<label class="block">
			<span class="mb-1 block text-xs font-medium text-base-content/70">Delay before reply (seconds)</span>
			<input
				type="number"
				min="0"
				max="86400"
				step="30"
				class="border-base-300 bg-base-100 text-base-content w-full rounded-md border px-3 py-2 text-sm"
				bind:value={delaySeconds}
				disabled={disabled || !enabled}
			/>
		</label>

		<div>
			<div class="mb-1 text-xs font-medium text-base-content/70">Reply message</div>
			<EditorPost
				charCount={charCount}
				softCharLimit={softCharLimit}
				bind:body={message}
				busy={disabled}
				comments={true}
				commentsMode={true}
			/>
		</div>
		<div class="flex justify-end">
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={!enabled || disabled}
				onclick={() => (message = 'Thanks for reading — replies welcome!')}
			>
				Example text
			</Button>
		</div>
	</div>
</div>
