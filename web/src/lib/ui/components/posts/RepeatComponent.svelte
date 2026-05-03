<script lang="ts">
	import type { RepeatIntervalKey } from '$lib/posts';

	type Option = { value: RepeatIntervalKey; label: string };

	type Props = {
		repeatInterval: RepeatIntervalKey | null;
		repeatOptions: Option[];
		disabled?: boolean;
		onChange: (value: RepeatIntervalKey | null) => void;
	};

	let { repeatInterval, repeatOptions, disabled = false, onChange }: Props = $props();
</script>

<div class="flex flex-col gap-1">
	<span class="text-xs font-medium text-base-content/60">Repeat</span>
	<select
		class="border-base-300 bg-base-100 rounded-md border px-2 py-1.5 text-sm"
		value={repeatInterval ?? ''}
		onchange={(e) => {
			const v = e.currentTarget.value;
			onChange(v === '' ? null : (v as RepeatIntervalKey));
		}}
		{disabled}
	>
		<option value="">
			No repeat</option>
		{#each repeatOptions as opt (opt.value)}
			<option value={opt.value}>
				{opt.label}</option>
		{/each}
	</select>
</div>
