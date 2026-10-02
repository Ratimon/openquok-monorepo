<script lang="ts">
	import { listAvailablePublicChannels } from '$lib/content/constants/channels';
	import { publicChannelSelectLabel } from '$lib/link-directory/utils/publicChannelSelectLabel';

	const helperText =
		'Only networks users connect in OpenQuok workspace. Slug must match the integration identifier (e.g. bluesky, facebook).';

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
		label,
		value = $bindable(''),
		class: className = '',
		onValueChange
	}: Props = $props();

	const options = $derived.by((): ChannelOption[] => {
		const channels = listAvailablePublicChannels();
		const bySlug = new Map(channels.map((channel) => [channel.slug, channel]));
		const rows: ChannelOption[] = [
			{ value: '', label: 'None — external platform only' },
			...channels.map((channel) => ({
				value: channel.slug,
				label: `${publicChannelSelectLabel(channel)} (${channel.slug})`
			}))
		];
		const trimmed = value.trim();
		if (trimmed && !bySlug.has(trimmed)) {
			rows.push({ value: trimmed, label: `${trimmed} (not in public channel catalog)` });
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

{#snippet channelSelect()}
	<select {id} class={selectClass} {value} onchange={handleChange}>
		{#each options as opt (opt.value)}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
{/snippet}

{#if label}
	<label class="form-control">
		<span class="label-text text-sm">{label}</span>
		{@render channelSelect()}
		<span class="label-text-alt mt-1 block text-left leading-snug text-base-content/70">
			{helperText}
		</span>
	</label>
{:else}
	<div>
		{@render channelSelect()}
		<p class="mt-1 text-left text-xs leading-snug text-base-content/70">{helperText}</p>
	</div>
{/if}
