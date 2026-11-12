<script lang="ts">
	import { listPublicDirectoryChannelOptions } from '$lib/content/constants/channels/catalog/publicDirectoryChannelOptions';
	import { trimFormField } from '$lib/utils/trimFormField';

	type ChannelOption = { value: string; label: string };

	type Props = {
		id?: string;
		label?: string;
		value?: string;
		class?: string;
		onValueChange?: (value: string) => void;
	};

	let {
		id,
		label = 'Directory launch channel',
		value = $bindable(''),
		class: className = '',
		onValueChange
	}: Props = $props();

	const options = $derived.by((): ChannelOption[] => {
		const catalog = listPublicDirectoryChannelOptions();
		const bySlug = new Map(catalog.map((row) => [row.slug, row]));
		const rows: ChannelOption[] = [
			{ value: '', label: 'Select channel…' },
			...catalog.map((row) => ({
				value: row.slug,
				label: `${row.label} (${row.slug})`
			}))
		];
		const trimmed = trimFormField(value);
		if (trimmed && !bySlug.has(trimmed as (typeof catalog)[number]['slug'])) {
			rows.push({ value: trimmed, label: `${trimmed} (not in directory catalog)` });
		}
		return rows;
	});

	const selectClass = $derived(className || 'select select-bordered w-full');

	function handleChange(e: Event) {
		const next = (e.currentTarget as HTMLSelectElement).value;
		value = next;
		onValueChange?.(next);
	}
</script>

<label class="form-control">
	<span class="label-text text-sm">{label}</span>
	<select {id} class={selectClass} {value} onchange={handleChange}>
		{#each options as opt (opt.value)}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
	<span class="label-text-alt mt-1 block text-left leading-snug text-base-content/70">
		Links to <span class="font-mono">/channels/peerpush</span> and other directory launch pages.
	</span>
</label>
