<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import type { DocMeta, DocsTabDefinition } from '$lib/docs/types';
	import type { SocialLink } from '$lib/ui/components/docs/nav/DocsSocialLinks.svelte';

	import { onMount } from 'svelte';
	import { page } from '$app/state';

	import { publicLayoutPagePresenter } from '$lib/area-public/index';
	import {
		PUBLIC_FOOTER_LINKS,
		SOCIAL_FOLLOW_BAR_LINKS,
		getSocialProfileHref
	} from '$lib/config/constants/config';
	import { docsSite, docsSidebarWidthCss } from '$lib/docs/constants';
	import { isOpenapiReferenceChrome } from '$lib/docs/utils/openapi-docs-layout';
	import { ensureDefaultTheme } from '$lib/ui/daisyui/ThemeSwitcher.svelte';

	import { icons } from '$data/icons';

	import DocsHeader from '$lib/ui/components/docs/layout/DocsHeader.svelte';
	import DocsSidebarLeft from '$lib/ui/components/docs/layout/DocsSidebarLeft.svelte';
	import DocsSidebarRight from '$lib/ui/components/docs/layout/DocsSidebarRight.svelte';
	import * as Sidebar from '$lib/ui/sidebar-main/index.js';
	import Footer from '$lib/ui/templates/Footer.svelte';

	type Props = { data: LayoutData; children: Snippet };

	let { data, children }: Props = $props();

	let navigation = $derived(data.navigation);
	let navigationSearchIndex = $derived(data.navigationSearchIndex ?? data.navigation);
	let tabLabel = $derived(
		data.docsTabs?.find((t: DocsTabDefinition) => t.id === data.activeDocsTabId)?.label ??
			'Documentation'
	);

	let docMeta = $derived(page.data.meta as DocMeta | undefined);
	let showDocsRightSidebar = $derived(!isOpenapiReferenceChrome(docMeta));

	let footerNavigationLinks = $derived(
		(page.data as { footerNavigationLinks?: typeof PUBLIC_FOOTER_LINKS }).footerNavigationLinks ??
			PUBLIC_FOOTER_LINKS
	);
	let companyNameVm = $derived(
		(data as App.LayoutData).companyNameVm ??
			(page.data as App.LayoutData).companyNameVm ??
			publicLayoutPagePresenter.companyNameVm ??
			'OPENQUOK'
	);
	let companyYearVm = $derived(
		(data as App.LayoutData).companyYearVm ??
			(page.data as App.LayoutData).companyYearVm ??
			publicLayoutPagePresenter.companyYearVm ??
			new Date().getFullYear().toString()
	);
	let companyAddressVm = $derived(
		(data as App.LayoutData).companyAddressVm ??
			(page.data as App.LayoutData).companyAddressVm ??
			publicLayoutPagePresenter.companyAddressVm ??
			''
	);
	let supportPhoneVm = $derived(
		(data as App.LayoutData).supportPhoneVm ??
			(page.data as App.LayoutData).supportPhoneVm ??
			publicLayoutPagePresenter.supportPhoneVm ??
			''
	);
	let supportEmailVm = $derived(
		(data as App.LayoutData).supportEmailVm ??
			(page.data as App.LayoutData).supportEmailVm ??
			publicLayoutPagePresenter.supportEmailVm ??
			''
	);

	/** Sidebar only: GitHub repo + same follow profiles as landing footer. */
	const socialLinks = $derived.by((): SocialLink[] => {
		const out: SocialLink[] = [];
		if (docsSite.social.github) {
			out.push({
				platform: 'github',
				url: docsSite.social.github,
				label: 'GitHub',
				icon: icons.Github.name
			});
		}
		for (const link of SOCIAL_FOLLOW_BAR_LINKS) {
			const href = getSocialProfileHref(link.CHANNEL_ID);
			if (!href) continue;
			out.push({
				platform: link.CHANNEL_NAME.toLowerCase(),
				url: href,
				label: link.CHANNEL_NAME,
				icon: link.Icon
			});
		}
		return out;
	});

	onMount(() => {
		ensureDefaultTheme('forest');
	});
</script>

<section class="flex min-h-svh flex-col">
	<a
		href="#doc-content"
		class="bg-primary text-primary-content fixed left-4 top-4 z-[100] -translate-y-20 rounded-md px-4 py-2 text-sm font-medium transition-transform focus:translate-y-0"
	>
		Skip to content
	</a>
	<Sidebar.Provider style={docsSidebarWidthCss} class="min-h-0 flex-1">
		<DocsSidebarLeft {navigation} searchNavigation={navigationSearchIndex} {tabLabel} {socialLinks} />
		<!-- Do not set overflow-x-* here: any non-visible overflow on an ancestor breaks position:sticky for the API docs rail -->
		<Sidebar.Inset class="min-w-0 flex-1">
			<DocsHeader
				docsTabs={data.docsTabs ?? []}
				activeDocsTabId={data.activeDocsTabId}
				locale={data.locale}
			/>
			<div class="flex min-h-0 min-w-0 flex-1 flex-col gap-4 p-4">
				{@render children()}
			</div>
		</Sidebar.Inset>
		{#if showDocsRightSidebar}
			<DocsSidebarRight navigation={navigationSearchIndex} />
		{/if}
	</Sidebar.Provider>
	<Footer
		{footerNavigationLinks}
		{companyNameVm}
		{companyYearVm}
		{companyAddressVm}
		{supportPhoneVm}
		{supportEmailVm}
	/>
</section>
