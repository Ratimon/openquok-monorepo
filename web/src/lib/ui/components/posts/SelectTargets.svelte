<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { socialProviderIcon } from '$lib/ui/components/posts/socialProviderIcons';
	import RemoveSocialAccount from '$lib/ui/components/posts/RemoveSocialAccount.svelte';

	type Mode = 'global' | 'custom';

	type Props = {
		mode: Mode;
		focusedIntegrationId: string | null;
		selectedIds: string[];
		channels: CreateSocialPostChannelViewModel[];
		onToggleGlobal: () => void;
		onRemoveSelected: (id: string) => void;
		onFocusIntegration: (id: string) => void;
		onRequestCustomize: (id: string) => void;
	};

	let {
		mode,
		focusedIntegrationId,
		selectedIds,
		channels,
		onToggleGlobal,
		onRemoveSelected,
		onFocusIntegration,
		onRequestCustomize
	}: Props = $props();

	let removeConfirmOpen = $state(false);
	let pendingRemoveId = $state<string | null>(null);

	function channelById(id: string): CreateSocialPostChannelViewModel | undefined {
		return channels.find((c) => c.id === id);
	}

	function requestRemove(id: string) {
		pendingRemoveId = id;
		removeConfirmOpen = true;
	}

	function confirmRemove() {
		const id = pendingRemoveId;
		removeConfirmOpen = false;
		pendingRemoveId = null;
		if (!id) return;
		onRemoveSelected(id);
	}
</script>

<div>
	<p class="mb-2 text-xs font-medium text-base-content/60">Targets for this post</p>

	<div class="flex flex-wrap items-center gap-2">
		<button
			type="button"
			class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 transition-colors {mode === 'global'
				? 'border-secondary bg-secondary/15 text-secondary'
				: 'border-base-300 bg-base-200/50 text-base-content/70'}"
			onclick={onToggleGlobal}
			aria-pressed={mode === 'global'}
			title="Global post"
		>
			<AbstractIcon name={icons.Globe.name} class="size-5" width="20" height="20" />
		</button>

		{#each selectedIds as sid (sid)}
			{@const ch = channelById(sid)}
			{#if ch}
				<span class="relative inline-flex">
					<button
						type="button"
						class="rounded-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
						onclick={() => (mode === 'global' ? onRequestCustomize(sid) : onFocusIntegration(sid))}
						aria-label="{mode === 'global' ? 'Customize channel ' : 'Focus channel '}{ch.name}"
					>
						<span
						class="relative block h-11 w-11 overflow-hidden rounded-full bg-base-200 ring-2 {mode === 'custom' && focusedIntegrationId === sid
							? 'ring-primary/70'
							: 'ring-primary/25'}"
						>
							{#if ch.picture}
								<img src={ch.picture} alt="" class="h-full w-full object-cover" draggable="false" />
							{:else}
								<span class="flex h-full w-full items-center justify-center text-xs text-base-content/50">
									{ch.name.slice(0, 2)}
								</span>
							{/if}
							<span
								class="absolute right-0 bottom-0 flex h-4 w-4 items-center justify-center rounded-full bg-base-100/90 ring-1 ring-base-300"
							>
								<AbstractIcon
									name={socialProviderIcon(ch.identifier)}
									class="size-2.5"
									width="10"
									height="10"
								/>
							</span>
						</span>
						<span class="sr-only">{ch.name}</span>
					</button>

					<button
						type="button"
						class="bg-error text-error-content absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold shadow"
						onclick={() => requestRemove(sid)}
						aria-label="Remove {ch.name}"
					>
						×
					</button>
				</span>
			{/if}
		{/each}
	</div>
</div>

<RemoveSocialAccount
	bind:open={removeConfirmOpen}
	onConfirm={confirmRemove}
	onCancel={() => (removeConfirmOpen = false)}
/>

