<script lang="ts">
	import { getRootPathPublicBlog } from '$lib/area-public/constants/getRootPathPublicBlog';
	import * as Breadcrumb from '$lib/ui/breadcrumb';
	import { cn } from '$lib/ui/helpers/common';
	import {
		PUBLIC_BLOG_BREADCRUMB_LINK_CLASS,
		PUBLIC_BLOG_BREADCRUMB_PAGE_CLASS,
		PUBLIC_LANDING_BREADCRUMB_SEPARATOR_CLASS
	} from '$lib/ui/templates/landing-page/publicLandingBreadcrumbStyles';
	import { url } from '$lib/utils/path';

	type Props = {
		pageTitle: string;
		class?: string;
	};

	let { pageTitle, class: className = '' }: Props = $props();

	// /blog
	const rootPathPublicBlog = getRootPathPublicBlog();
	const blogHubHref = url(`/${rootPathPublicBlog}`);
</script>

<Breadcrumb.Root class={cn('max-w-full', className)}>
	<Breadcrumb.List>
		<Breadcrumb.Item>
			<Breadcrumb.Link href={blogHubHref} class={PUBLIC_BLOG_BREADCRUMB_LINK_CLASS}>
				Blog
			</Breadcrumb.Link>
		</Breadcrumb.Item>
		<Breadcrumb.Separator class={PUBLIC_LANDING_BREADCRUMB_SEPARATOR_CLASS} />
		<Breadcrumb.Item>
			<Breadcrumb.Page class={PUBLIC_BLOG_BREADCRUMB_PAGE_CLASS}>{pageTitle}</Breadcrumb.Page>
		</Breadcrumb.Item>
	</Breadcrumb.List>
</Breadcrumb.Root>
