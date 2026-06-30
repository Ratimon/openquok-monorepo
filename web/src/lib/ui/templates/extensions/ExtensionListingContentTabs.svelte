<script lang="ts">
	import type { ListingFaqItemProgrammerModel } from '$lib/listings/listing.types';

	import * as Tabs from '$lib/ui/tabs';

	import ExtensionFaqList from '$lib/ui/templates/extensions/ExtensionFaqList.svelte';
	import ListingRichMarkdown from '$lib/ui/templates/extensions/ListingRichMarkdown.svelte';
	import {
		extensionDetailTabTriggerClass,
		extensionDetailTabsListClass
	} from '$lib/ui/templates/extensions/extensionDetailTabClasses';

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
		if (activeTab === 'about' && !showAbout) {
			activeTab = showReadme ? 'readme' : hasFaq ? 'faq' : 'readme';
		}
		if (activeTab === 'readme' && !showReadme) {
			activeTab = showAbout ? 'about' : hasFaq ? 'faq' : 'about';
		}
	});
</script>

<Tabs.Root bind:value={activeTab} class="w-full space-y-4">
	<Tabs.List class={extensionDetailTabsListClass}>
		{#if showAbout}
			<Tabs.Trigger value="about" class={extensionDetailTabTriggerClass}>About</Tabs.Trigger>
		{/if}
		{#if showReadme}
			<Tabs.Trigger value="readme" class={extensionDetailTabTriggerClass}>README</Tabs.Trigger>
		{/if}
		{#if hasFaq}
			<Tabs.Trigger value="faq" class={extensionDetailTabTriggerClass}>FAQ</Tabs.Trigger>
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
			<ExtensionFaqList items={faqItems} />
		</Tabs.Content>
	{/if}
</Tabs.Root>
