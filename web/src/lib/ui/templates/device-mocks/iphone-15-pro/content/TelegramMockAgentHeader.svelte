<script lang="ts">
	import type { IconEntry, IconName } from '$data/icons';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		agentIcon?: IconName;
		agentLabel?: string;
	};

	let { agentIcon = icons.OpenClaw.name, agentLabel = 'OpenClaw' }: Props = $props();

	let iconMeta = $derived(icons[agentIcon] as IconEntry | undefined);
	let iconIsFill = $derived(iconMeta?.fill === true);
</script>

<div class="flex items-center gap-3 px-3.5 pb-3 pt-1.5">
	<span class="shrink-0 text-lg leading-none opacity-90" aria-hidden="true">‹</span>
	<div
		class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-[#2EA6DE]"
	>
		<AbstractIcon
			name={agentIcon}
			class={iconIsFill ? 'size-full' : 'size-5'}
			width={iconIsFill ? '40' : '20'}
			height={iconIsFill ? '40' : '20'}
			aria-hidden="true"
		/>
	</div>
	<div class="min-w-0">
		<h2 class="truncate text-base font-semibold leading-tight">{agentLabel}</h2>
		<p class="mt-0.5 text-xs opacity-80">bot</p>
	</div>
</div>
