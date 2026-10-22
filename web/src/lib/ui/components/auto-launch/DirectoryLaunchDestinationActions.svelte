<script lang="ts">
	import type { AutoLaunchDestinationDto } from '$lib/auto-launch/auto-launch.types';

	import {
		formatDirectoryLaunchCostLabel,
		formatDirectoryLaunchDofollowLabel
	} from '$lib/auto-launch/utils/directoryLaunchPickerLabels';

	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		destination: AutoLaunchDestinationDto;
		completed?: boolean;
		busy?: boolean;
		onFillExtension: () => void;
		onMarkComplete: () => void;
	};

	let { destination, completed = false, busy = false, onFillExtension, onMarkComplete }: Props =
		$props();

	const dofollowLabel = $derived(formatDirectoryLaunchDofollowLabel(destination.opportunityDofollow));
	const costLabel = $derived(formatDirectoryLaunchCostLabel(destination));
</script>

<div class="flex flex-col gap-2 rounded-lg border border-base-300/80 bg-base-100/50 p-3">
	<div class="flex flex-wrap items-start justify-between gap-2">
		<span class="font-medium text-base-content">{destination.name}</span>
		{#if completed}
			<span class="badge badge-sm badge-success badge-outline">Done</span>
		{/if}
	</div>
	{#if destination.shortDescription || destination.opportunityTitle}
		<p class="text-sm text-base-content/70 line-clamp-2">
			{destination.shortDescription ?? destination.opportunityTitle}
		</p>
	{/if}
	<div class="flex flex-wrap gap-1.5">
		{#if dofollowLabel}
			<span
				class="badge badge-sm {destination.opportunityDofollow === 'dofollow'
					? 'badge-success'
					: destination.opportunityDofollow === 'nofollow'
						? 'badge-warning'
						: 'badge-ghost'}"
			>
				{dofollowLabel}
			</span>
		{/if}
		<span class="badge badge-sm badge-ghost">{costLabel}</span>
		<span class="badge badge-sm badge-primary badge-outline">Via extension</span>
	</div>
	<div class="flex flex-wrap gap-2 pt-1">
		<Button type="button" variant="primary" size="sm" disabled={busy} onclick={onFillExtension}>
			Fill with extension
		</Button>
		<Button
			type="button"
			variant="ghost"
			size="sm"
			disabled={busy || completed}
			onclick={onMarkComplete}
		>
			Mark complete
		</Button>
	</div>
</div>
