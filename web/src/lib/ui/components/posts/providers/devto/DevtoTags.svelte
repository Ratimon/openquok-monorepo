<script lang="ts">
	import type { DevtoTagOption } from '$lib/ui/components/posts/providers/provider.types';

	import { DEVTO_MAX_TAGS } from '$lib/ui/components/posts/providers/devto/devto.provider';

	type Props = {
		label?: string;
		maxTags?: number;
		placeholder?: string;
		suggestions?: DevtoTagOption[];
		value?: DevtoTagOption[];
		disabled?: boolean;
	};

	let {
		label = 'Tags',
		maxTags = DEVTO_MAX_TAGS,
		placeholder = 'Add a tag and press Enter',
		suggestions = [],
		value = $bindable([]),
		disabled = false
	}: Props = $props();

	let input = $state('');

	const filteredSuggestions = $derived.by(() => {
		const q = input.trim().toLowerCase();
		const taken = new Set(value.map((t) => t.label.toLowerCase()));
		return suggestions
			.filter((s) => {
				const name = s.label.toLowerCase();
				if (taken.has(name)) return false;
				if (!q) return true;
				return name.includes(q);
			})
			.slice(0, 8);
	});

	function emit(next: DevtoTagOption[]) {
		value = next.slice(0, maxTags);
	}

	function addTag(option: DevtoTagOption) {
		if (disabled) return;
		if (value.length >= maxTags) return;
		const labelText = option.label.trim();
		if (!labelText) return;
		if (value.some((t) => t.label.toLowerCase() === labelText.toLowerCase())) return;
		emit([...value, { value: option.value || labelText, label: labelText }]);
		input = '';
	}

	function addFromInput() {
		const raw = input.trim().replace(/^#/, '');
		if (!raw) return;
		const match = suggestions.find((s) => s.label.toLowerCase() === raw.toLowerCase());
		addTag(match ?? { value: raw, label: raw });
	}

	function remove(tag: string) {
		if (disabled) return;
		emit(value.filter((t) => t.label !== tag));
	}
</script>

<div class="space-y-2">
	<div class="text-xs font-medium text-base-content/70">{label} (max {maxTags})</div>

	<div class="border-base-300 bg-base-100 rounded-md border p-2">
		<div class="flex flex-wrap gap-2">
			{#each value as tag (tag.label)}
				<span class="bg-base-200 text-base-content inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs">
					<span>{tag.label}</span>
					<button
						type="button"
						class="hover:bg-base-300 rounded-full px-1 text-base-content/60 hover:text-base-content"
						onclick={() => remove(tag.label)}
						aria-label={`Remove ${tag.label}`}
						{disabled}
					>
						×
					</button>
				</span>
			{/each}

			<input
				class="min-w-[140px] flex-1 bg-transparent px-1 py-1 text-sm outline-none disabled:opacity-50"
				bind:value={input}
				{placeholder}
				{disabled}
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

	{#if filteredSuggestions.length > 0 && !disabled}
		<div class="flex flex-wrap gap-1">
			{#each filteredSuggestions as suggestion (suggestion.value + suggestion.label)}
				<button
					type="button"
					class="border-base-300 hover:bg-base-200 rounded-md border px-2 py-0.5 text-xs"
					onmousedown={(e) => e.preventDefault()}
					onclick={() => addTag(suggestion)}
				>
					{suggestion.label}
				</button>
			{/each}
		</div>
	{/if}

	<div class="text-xs text-base-content/50">{value.length}/{maxTags} tags</div>
</div>
