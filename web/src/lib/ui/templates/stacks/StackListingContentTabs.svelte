<script lang="ts">
	import type { Snippet } from 'svelte';

	import * as Tabs from '$lib/ui/tabs';

	import ListingRichMarkdown from '$lib/ui/templates/extensions/ListingRichMarkdown.svelte';
	import {
		extensionDetailTabTriggerClass,
		extensionDetailTabsListClass
	} from '$lib/ui/templates/extensions/extensionDetailTabClasses';

	type Props = {
		content?: string | null;
		readmeEmptyMessage?: string;
		members: Snippet;
		readmeExtras?: Snippet;
	};

	let {
		content = null,
		readmeEmptyMessage = 'No README content yet.',
		members,
		readmeExtras
	}: Props = $props();

	let activeTab = $state<'members' | 'readme'>('members');

	const hasReadme = $derived(Boolean(content?.trim()));
</script>

<Tabs.Root bind:value={activeTab} class="w-full space-y-4">
	<Tabs.List class={extensionDetailTabsListClass}>
		<Tabs.Trigger value="members" class={extensionDetailTabTriggerClass}>Stack members</Tabs.Trigger>
		{#if hasReadme}
			<Tabs.Trigger value="readme" class={extensionDetailTabTriggerClass}>README</Tabs.Trigger>
		{/if}
	</Tabs.List>

	<Tabs.Content value="members">
		{@render members()}
	</Tabs.Content>

	{#if hasReadme}
		<Tabs.Content value="readme" class="space-y-8">
			<ListingRichMarkdown markdown={content} emptyMessage={readmeEmptyMessage} />
			{#if readmeExtras}
				{@render readmeExtras()}
			{/if}
		</Tabs.Content>
	{/if}
</Tabs.Root>
