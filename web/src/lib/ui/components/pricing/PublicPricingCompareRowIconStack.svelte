<script lang="ts">
	import type { IconName } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		icons: readonly IconName[];
	};

	let { icons: iconNames }: Props = $props();
</script>

<div class="flex shrink-0 -space-x-1.5" aria-hidden="true">
	{#each iconNames as iconName, i (`${iconName}-${i}`)}
		<span
			class="relative grid size-7 place-items-center rounded-full border border-base-200 bg-base-100 shadow-sm ring-1 ring-base-content/5"
			style="z-index: {iconNames.length - i}"
		>
			<AbstractIcon
				name={iconName}
				class="size-3.5"
				width="14"
				height="14"
				focusable="false"
			/>
		</span>
	{/each}
</div>