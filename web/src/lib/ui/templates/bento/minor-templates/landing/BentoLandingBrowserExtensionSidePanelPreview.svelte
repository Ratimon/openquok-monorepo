<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
</script>

<div class="select-none bg-base-100 text-base-content">
	<div
		class="flex items-center gap-2 border-b border-base-300 bg-base-200/60 px-3 py-2"
		aria-hidden="true"
	>
		<AbstractIcon name={icons.Sparkles.name} class="size-4 text-primary" width="16" height="16" />
		<p class="truncate text-xs text-base-content/70">OpenQuok extension · Social</p>
	</div>

	<div class="space-y-4 p-4 sm:p-5">
		<div class="rounded-xl border border-base-300 bg-base-200/40 p-4">
			<p class="text-sm font-semibold">Connect to OpenQuok</p>
			<p class="mt-1 text-xs text-base-content/65">
				Use the same site as your dashboard tab (hosted or self-host).
			</p>
			<div class="mt-3 flex flex-wrap gap-2">
				<span class="btn btn-primary btn-sm pointer-events-none">Connect</span>
				<span class="btn btn-outline btn-sm pointer-events-none">Refresh session</span>
			</div>
		</div>

		<div class="flex flex-wrap gap-2">
			{#each ['Facebook', 'Threads', 'Skool'] as label (label)}
				<span
					class="grid size-10 place-items-center rounded-full bg-base-200 ring-2 ring-primary"
					title={label}
				>
					<span class="text-[0.6rem] font-bold text-base-content/70">{label.slice(0, 1)}</span>
				</span>
			{/each}
		</div>
	</div>
</div>
