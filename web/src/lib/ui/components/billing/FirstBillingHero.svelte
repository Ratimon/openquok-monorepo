<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		allowTrial?: boolean;
	};

	let { allowTrial = false }: Props = $props();
</script>

<h1 class="text-balance text-3xl font-semibold leading-tight md:text-4xl">
	Choose a plan to unlock your agent workspace
</h1>
{#if allowTrial}
	<ul class="mt-6 flex flex-col gap-3 text-base font-medium">
		<li class="flex items-center gap-2">
			<AbstractIcon
				name={icons.CircleCheck.name}
				class="text-success"
				width="17"
				height="17"
			/>
			100% no-risk free trial
		</li>
		<li class="flex items-center gap-2">
			<AbstractIcon
				name={icons.CircleCheck.name}
				class="text-success"
				width="17"
				height="17"
			/>
			Pay nothing for the first 7 days
		</li>
		<li class="flex items-center gap-2">
			<AbstractIcon
				name={icons.CircleCheck.name}
				class="text-success"
				width="17"
				height="17"
			/>
			Cancel anytime from billing settings
		</li>
	</ul>
{/if}
