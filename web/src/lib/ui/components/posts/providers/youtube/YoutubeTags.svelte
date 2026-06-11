<script lang="ts">
	import type { YoutubeTagOption } from '$lib/ui/components/posts/providers/provider.types';

	type Props = {
		label: string;
		maxTags?: number;
		placeholder?: string;
		value?: YoutubeTagOption[];
		onChange?: (next: YoutubeTagOption[]) => void;
	};

	let {
		label,
		maxTags = 30,
		placeholder = 'Add a tag',
		value = $bindable([]),
		onChange
	}: Props = $props();

	let input = $state('');

	function emit(next: YoutubeTagOption[]) {
		value = next;
		onChange?.(next);
	}

	function addFromInput() {
		const raw = input.trim();
		if (!raw) return;
		if (value.length >= maxTags) return;

		const tag = raw.replace(/^#/, '').trim();
		if (!tag) return;
		if (value.some((t) => t.value === tag)) return;

		emit([...value, { value: tag, label: tag }]);
		input = '';
	}

	function remove(tag: string) {
		emit(value.filter((t) => t.value !== tag));
	}
</script>

<div class="space-y-2">
	<div class="text-xs font-medium text-base-content/70">{label}</div>

	<div class="border-base-300 bg-base-100 rounded-md border p-2">
		<div class="flex flex-wrap gap-2">
			{#each value as tag (tag.value)}
				<span class="bg-base-200 text-base-content inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs">
					<span>{tag.label}</span>
					<button
						type="button"
						class="hover:bg-base-300 rounded-full px-1 text-base-content/60 hover:text-base-content"
						onclick={() => remove(tag.value)}
						aria-label={`Remove ${tag.label}`}
					>
						×
					</button>
				</span>
			{/each}

			<input
				class="min-w-[140px] flex-1 bg-transparent px-1 py-1 text-sm outline-none"
				bind:value={input}
				{placeholder}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ',') {
						e.preventDefault();
						addFromInput();
					}
					if (e.key === 'Backspace' && input.length === 0 && value.length) {
						e.preventDefault();
						emit(value.slice(0, -1));
					}
				}}
				onblur={() => addFromInput()}
			/>
		</div>
	</div>

	<div class="text-xs text-base-content/50">{value.length}/{maxTags} tags</div>
</div>
