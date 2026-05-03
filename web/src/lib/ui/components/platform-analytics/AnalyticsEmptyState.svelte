<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		title: string;
		description?: string;
		actionLabel?: string;
		onAction?: (() => void) | null;
	};

	let { title, description = '', actionLabel = 'Action', onAction = null }: Props = $props();
</script>

<div class="rounded-xl border border-base-300 bg-base-100/60 p-6 text-center shadow-sm">
	<div class="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
		<AbstractIcon name={icons.CircleAlert.name} class="size-6" width="24" height="24" />
	</div>
	<p class="text-sm font-semibold text-base-content">
		{title}</p>
	{#if description}
		<p class="mt-2 text-sm text-base-content/70">
			{description}</p>
	{/if}
	{#if onAction}
		<div class="mt-4 flex justify-center">
			<Button type="button" variant="primary" class="gap-2" onclick={() => onAction?.()}>
				<AbstractIcon name={icons.RefreshCw.name} class="size-4" width="16" height="16" />
				{actionLabel}
			</Button>
		</div>
	{/if}
</div>

