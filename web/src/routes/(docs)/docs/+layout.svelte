<script lang="ts">
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';
	import { page } from '$app/state';
	import type { DocMeta } from '$lib/docs/types';
	import { isOpenapiReferenceChrome } from '$lib/docs/utils/openapi-docs-layout';
	import DocsHeader from '$lib/ui/components/docs/layout/DocsHeader.svelte';
	import DocsSidebarLeft from '$lib/ui/components/docs/layout/DocsSidebarLeft.svelte';
	import DocsSidebarRight from '$lib/ui/components/docs/layout/DocsSidebarRight.svelte';
	import * as Sidebar from '$lib/ui/sidebar-main/index.js';
	import { ensureDefaultTheme } from '$lib/ui/daisyui/ThemeSwitcher.svelte';
	import { docsSite } from '$lib/docs/constants/config';

	type Props = { data: LayoutData; children: import('svelte').Snippet };

	let { data, children }: Props = $props();

	let navigation = $derived(data.navigation);

	let docMeta = $derived(page.data.meta as DocMeta | undefined);
	let showDocsRightSidebar = $derived(!isOpenapiReferenceChrome(docMeta));

	const socialLinks = $derived.by(() => {
		const out: { platform: string; url: string; label?: string }[] = [];
		if (docsSite.social.github) {
			out.push({ platform: 'github', url: docsSite.social.github, label: 'GitHub' });
		}
		if (docsSite.social.twitter?.trim()) {
			out.push({ platform: 'twitter', url: docsSite.social.twitter.trim(), label: 'X (Twitter)' });
		}
		return out;
	});

	onMount(() => {
		ensureDefaultTheme('forest');
	});
</script>

<a
	href="#doc-content"
	class="bg-primary text-primary-content fixed left-4 top-4 z-[100] -translate-y-20 rounded-md px-4 py-2 text-sm font-medium transition-transform focus:translate-y-0"
>
	Skip to content
</a>
<Sidebar.Provider>
	<DocsSidebarLeft {navigation} {socialLinks} />
	<!-- Do not set overflow-x-* here: any non-visible overflow on an ancestor breaks position:sticky for the API docs rail -->
	<Sidebar.Inset class="min-w-0 flex-1">
		<DocsHeader {socialLinks} />
		<div class="flex min-h-0 min-w-0 flex-1 flex-col gap-4 p-4">
			{@render children()}
		</div>
	</Sidebar.Inset>
	{#if showDocsRightSidebar}
		<DocsSidebarRight {navigation} />
	{/if}
</Sidebar.Provider>
