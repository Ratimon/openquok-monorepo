<script lang="ts">
	import { getTimeZoneSelectOptionsIncluding } from '$lib/utils/postingSchedulePreferences';

	type Props = {
		id: string;
		value: string;
		class?: string;
		onValueChange?: (value: string) => void;
	};

	let { id, value = $bindable(), class: className = '', onValueChange }: Props = $props();

	const options = $derived(getTimeZoneSelectOptionsIncluding(value));
</script>

<select
	{id}
	class={className ||
		'select select-bordered border-base-300 bg-base-100 w-full'}
	{value}
	onchange={(e) => {
		const next = (e.currentTarget as HTMLSelectElement).value;
		value = next;
		onValueChange?.(next);
	}}
>
	{#each options as opt (opt.value)}
		<option value={opt.value}>{opt.label}</option>
	{/each}
</select>
