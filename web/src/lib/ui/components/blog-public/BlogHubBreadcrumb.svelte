<script lang="ts">
	import { page } from '$app/state';

	import { resolveBlogBreadcrumbItemsForUi } from '$lib/blogs/utils/buildBlogBreadcrumbItems';
	import {
		PUBLIC_BLOG_BREADCRUMB_LINK_CLASS,
		PUBLIC_BLOG_BREADCRUMB_PAGE_CLASS
	} from '$lib/ui/templates/landing-page/publicLandingBreadcrumbStyles';
	import PublicLandingHubBreadcrumb from '$lib/ui/templates/landing-page/PublicLandingHubBreadcrumb.svelte';

	type Props = {
		pageTitle: string;
		class?: string;
	};

	let { pageTitle, class: className = '' }: Props = $props();

	const items = $derived(resolveBlogBreadcrumbItemsForUi(pageTitle, page.url.origin));
</script>

<PublicLandingHubBreadcrumb
	{items}
	class={className}
	linkClass={PUBLIC_BLOG_BREADCRUMB_LINK_CLASS}
	pageClass={PUBLIC_BLOG_BREADCRUMB_PAGE_CLASS}
/>
