<script lang="ts">
	import type { ListingFaqItemProgrammerModel } from '$lib/listings/listing.types';

	import * as Tabs from '$lib/ui/tabs';

	import BuildingBlockFaqList from '$lib/ui/templates/building-blocks/BuildingBlockFaqList.svelte';
	import ListingRichMarkdown from '$lib/ui/templates/listings/ListingRichMarkdown.svelte';
	import {
		buildingBlockDetailTabTriggerClass,
		buildingBlockDetailTabsListClass
	} from '$lib/ui/templates/building-blocks/buildingBlockDetailTabClasses';

	type Props = {
		description?: string | null;
		content?: string | null;
		faq?: ListingFaqItemProgrammerModel[] | null;
		aboutEmptyMessage?: string;
		readmeEmptyMessage?: string;
	};

	let {
		description = null,
		content = null,
		faq = null,
		aboutEmptyMessage = 'No about content yet.',
		readmeEmptyMessage = 'No README content yet.'
	}: Props = $props();

	let activeTab = $state<'about' | 'readme' | 'faq'>('about');

	const faqItems = $derived(faq ?? []);
	const hasFaq = $derived(faqItems.length > 0);
	const normalizedDescription = $derived(description?.trim() ?? '');
	const normalizedContent = $derived(content?.trim() ?? '');
	const hasDescription = $derived(normalizedDescription.length > 0);
	const hasContent = $derived(normalizedContent.length > 0);
	const contentDuplicatesDescription = $derived(
		hasDescription && hasContent && normalizedDescription === normalizedContent
	);
	const showAbout = $derived(hasDescription && !contentDuplicatesDescription);
	const showReadme = $derived(hasContent);

	$effect(() => {
		const fallback =
			(showAbout && 'about') || (showReadme && 'readme') || (hasFaq && 'faq') || null;
		if (!fallback) return;

		const isCurrentValid =
			(activeTab === 'about' && showAbout) ||
			(activeTab === 'readme' && showReadme) ||
			(activeTab === 'faq' && hasFaq);

		if (!isCurrentValid) {
			activeTab = fallback;
		}
	});
</script>

<Tabs.Root bind:value={activeTab} class="w-full space-y-4">
	<Tabs.List class={buildingBlockDetailTabsListClass}>
		{#if showAbout}
			<Tabs.Trigger value="about" class={buildingBlockDetailTabTriggerClass}>About</Tabs.Trigger>
		{/if}
		{#if showReadme}
			<Tabs.Trigger value="readme" class={buildingBlockDetailTabTriggerClass}>README</Tabs.Trigger>
		{/if}
		{#if hasFaq}
			<Tabs.Trigger value="faq" class={buildingBlockDetailTabTriggerClass}>FAQ</Tabs.Trigger>
		{/if}
	</Tabs.List>

	{#if showAbout}
		<Tabs.Content value="about">
			<p class="text-base-content/80">{normalizedDescription}</p>
		</Tabs.Content>
	{/if}

	{#if showReadme}
		<Tabs.Content value="readme">
			<ListingRichMarkdown markdown={content} emptyMessage={readmeEmptyMessage} />
		</Tabs.Content>
	{/if}

	{#if hasFaq}
		<Tabs.Content value="faq">
			<BuildingBlockFaqList items={faqItems} />
		</Tabs.Content>
	{/if}
</Tabs.Root>
