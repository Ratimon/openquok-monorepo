<script lang="ts">
	import { normalizeHttpUrlInputIfLikely } from '$lib/utils/normalizeHttpUrlInput';
	import { cn } from '$lib/ui/helpers/common';

	import ProviderHttpUrlInput from '$lib/ui/components/posts/providers/ProviderHttpUrlInput.svelte';

	type Props = {
		id: string;
		label: string;
		value?: string;
		disabled?: boolean;
		invalid?: boolean;
		error?: string | null;
		wide?: boolean;
	};

	let {
		id,
		label,
		value = $bindable(''),
		disabled = false,
		invalid = false,
		error = null,
		wide = false
	}: Props = $props();

	function normalizeOnBlur() {
		const trimmed = value.trim();
		if (!trimmed) return;
		const normalized = normalizeHttpUrlInputIfLikely(trimmed);
		if (normalized !== value) value = normalized;
	}
</script>

<label class={cn('form-control w-full gap-1', wide && 'sm:col-span-2')}>
	<span class="text-sm font-medium text-base-content">{label}</span>
	<ProviderHttpUrlInput
		{id}
		class={cn('w-full', invalid && 'input-error')}
		placeholder="https://"
		bind:value
		{disabled}
		onblur={normalizeOnBlur}
	/>
	{#if error}
		<p class="text-xs text-error" role="alert">{error}</p>
	{/if}
</label>
