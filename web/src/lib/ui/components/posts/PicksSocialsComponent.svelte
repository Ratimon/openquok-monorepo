<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';
	import { socialProviderIcon } from '$data/social-providers';

	type Props = {
		channels: CreateSocialPostChannelViewModel[];
		selectedIds: string[];
		onToggleChannel: (id: string) => void;
	};

	let { channels, selectedIds, onToggleChannel }: Props = $props();
</script>

<div>
	<p class="mb-2 text-xs font-medium text-base-content/60">Connected channels</p>
	<div class="flex flex-wrap gap-3">
		{#each channels as ch (ch.id)}
			{@const schedulable = ch.schedulable}
			{@const selected = selectedIds.includes(ch.id)}
			<button
				type="button"
				class="ring-primary/60 relative shrink-0 rounded-full focus-visible:ring-2 focus-visible:outline-none {schedulable || selected
					? ''
					: 'cursor-not-allowed opacity-60'} {selectedIds.includes(
					ch.id
				)
					? 'ring-2'
					: 'ring-0'}"
				onclick={() => onToggleChannel(ch.id)}
				aria-pressed={selectedIds.includes(ch.id)}
				aria-disabled={!schedulable && !selected}
				aria-label="Toggle channel {ch.name}"
				title={schedulable ? ch.name : `${ch.name}: ${ch.unschedulableReason ?? 'Reconnect required'}`}
			>
				<span
					class="relative block h-12 w-12 overflow-hidden rounded-full bg-base-200 transition {selectedIds.includes(
						ch.id
					)
						? 'grayscale-0'
						: 'grayscale opacity-70'}"
				>
					{#if ch.picture?.trim()}
						<IntegrationChannelPicture
							profilePictureUrl={ch.picture}
							fallbackIcon={socialProviderIcon(ch.identifier)}
							alt=""
							class="h-full w-full object-cover"
						/>
					{:else}
						<span class="flex h-full w-full items-center justify-center text-xs text-base-content/50">
							{ch.name.slice(0, 2)}
						</span>
					{/if}
					<span
						class="absolute right-0 bottom-0 flex h-5 w-5 items-center justify-center rounded-full bg-base-100/90 ring-1 ring-base-300"
					>
						<AbstractIcon name={socialProviderIcon(ch.identifier)} class="size-3.5" width="14" height="14" />
					</span>
				</span>
			</button>
		{/each}
	</div>
</div>
