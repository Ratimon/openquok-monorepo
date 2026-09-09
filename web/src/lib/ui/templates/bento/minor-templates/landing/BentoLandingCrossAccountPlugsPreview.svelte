<script lang="ts">
	import { icons } from '$data/icons';

	import * as Tabs from '$lib/ui/tabs';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import BentoLinkedinSettingsPreview from '$lib/ui/templates/bento/minor-templates/linkedin/BentoLinkedinSettingsPreview.svelte';
	import BentoThreadsComposerPreview from '$lib/ui/templates/bento/minor-templates/threads/BentoThreadsComposerPreview.svelte';
	import BentoXComposerPreview from '$lib/ui/templates/bento/minor-templates/x/BentoXComposerPreview.svelte';

	type PlatformTab = 'threads' | 'x' | 'linkedin';

	type Props = {
		isLoggedIn?: boolean;
	};

	let { isLoggedIn }: Props = $props();

	let activeTab = $state<PlatformTab>('threads');

	const tabTriggerClass =
		'inline-flex h-auto min-h-0 flex-1 items-center justify-center gap-2 rounded-lg border-0 !border-b-0 bg-transparent px-4 py-2.5 text-sm font-semibold text-base-content/75 transition-colors hover:bg-base-content/10 hover:text-base-content sm:flex-none [&.tab-active]:bg-primary [&.tab-active]:text-primary-content [&.tab-active]:shadow-md';

	const platformTabs: { id: PlatformTab; label: string; icon: string; plugAction: string }[] = [
		{
			id: 'threads',
			label: 'Threads',
			icon: icons.ThreadsGlyph.name,
			plugAction: 'Cross-account comment'
		},
		{ id: 'x', label: 'X', icon: icons.XGlyph.name, plugAction: 'Cross-account repost' },
		{
			id: 'linkedin',
			label: 'LinkedIn',
			icon: icons.LinkedInGlyph.name,
			plugAction: 'Comment or reshare'
		}
	];

	const activePlugAction = $derived(
		platformTabs.find((tab) => tab.id === activeTab)?.plugAction ?? ''
	);
</script>

<div class="bg-base-100 text-base-content">
	<Tabs.Root bind:value={activeTab} class="w-full">
		<div class="border-b border-base-300 px-3 py-2" aria-label="Cross-account plug platforms">
			<Tabs.List
				class="inline-flex w-full max-w-full flex-wrap gap-1 rounded-xl border-2 border-base-content/15 bg-base-200/60 p-1 shadow-sm !border-solid"
			>
				{#each platformTabs as tab (tab.id)}
					<Tabs.Trigger value={tab.id} class={tabTriggerClass}>
						<AbstractIcon name={tab.icon} class="size-4 shrink-0" width="16" height="16" />
						{tab.label}
					</Tabs.Trigger>
				{/each}
			</Tabs.List>
			{#if activePlugAction}
				<p class="mt-2 text-center text-xs text-base-content/60 sm:text-left">{activePlugAction}</p>
			{/if}
		</div>

		<Tabs.Content value="threads" class="mt-0">
			<BentoThreadsComposerPreview {isLoggedIn} variant="settings" crossAccountPlugsPreview={true} />
		</Tabs.Content>

		<Tabs.Content value="x" class="mt-0">
			<BentoXComposerPreview {isLoggedIn} variant="settings" crossAccountPlugsPreview={true} />
		</Tabs.Content>

		<Tabs.Content value="linkedin" class="mt-0">
			<BentoLinkedinSettingsPreview {isLoggedIn} variant="settings" crossAccountPlugsPreview={true} />
		</Tabs.Content>
	</Tabs.Root>
</div>
