<script lang="ts">
	import { icons } from '$data/icons';

	import * as Tabs from '$lib/ui/tabs';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import BentoLandingComposerPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingComposerPreview.svelte';
	import BentoLandingDirectoryProfileCasesPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingDirectoryProfileCasesPreview.svelte';

	type NetworkModeTab = 'social' | 'directory';

	type Props = {
		isLoggedIn?: boolean;
	};

	let { isLoggedIn }: Props = $props();

	let activeTab = $state<NetworkModeTab>('social');

	const tabTriggerClass =
		'inline-flex h-auto min-h-0 flex-1 items-center justify-center gap-2 rounded-lg border-0 !border-b-0 bg-transparent px-4 py-2.5 text-sm font-semibold text-base-content/75 transition-colors hover:bg-base-content/10 hover:text-base-content sm:flex-none [&.tab-active]:bg-primary [&.tab-active]:text-primary-content [&.tab-active]:shadow-md';

	const modeTabs: { id: NetworkModeTab; label: string; icon: string; hint: string }[] = [
		{
			id: 'social',
			label: 'Social',
			icon: icons.InstagramGlyph.name,
			hint: 'Per-network composer settings'
		},
		{
			id: 'directory',
			label: 'Directory launch',
			icon: icons.PeerPush.name,
			hint: 'Listing profile and autofill readiness'
		}
	];

	const activeHint = $derived(modeTabs.find((tab) => tab.id === activeTab)?.hint ?? '');
</script>

<div class="bg-base-100 text-base-content">
	<Tabs.Root bind:value={activeTab} class="w-full">
		<div class="border-b border-base-300 px-3 py-2" aria-label="Global vs per-target customization">
			<Tabs.List
				class="inline-flex w-full max-w-full flex-wrap gap-1 rounded-xl border-2 border-base-content/15 bg-base-200/60 p-1 shadow-sm !border-solid"
			>
				{#each modeTabs as tab (tab.id)}
					<Tabs.Trigger value={tab.id} class={tabTriggerClass}>
						<AbstractIcon name={tab.icon} class="size-4 shrink-0" width="16" height="16" />
						{tab.label}
					</Tabs.Trigger>
				{/each}
			</Tabs.List>
			{#if activeHint}
				<p class="mt-2 text-center text-xs text-base-content/60 sm:text-left">{activeHint}</p>
			{/if}
		</div>

		<Tabs.Content value="social" class="mt-0">
			<BentoLandingComposerPreview {isLoggedIn} />
		</Tabs.Content>

		<Tabs.Content value="directory" class="mt-0">
			<BentoLandingDirectoryProfileCasesPreview />
		</Tabs.Content>
	</Tabs.Root>
</div>
